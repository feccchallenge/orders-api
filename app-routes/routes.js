const express = require('express');
//const amqp = require('amqplib/callback_api');
const Redis = require('ioredis');
const Order = require('../app-domain/Order');
const { getOrderLogsProvider } = require('../app-logs/logsProviderStorage');
const { publishOrderToQueue } = require('../app-msg/msgProvider');


const REDIS_URI = process.env.REDIS_URI;

const redis = new Redis(REDIS_URI);

const createOrder = async (req, res) => {
    const { userId, products } = req.body;
  
    if (!userId || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
  
    const newOrder = new Order({
      userId,
      products,
      status: 'PENDING',
    });
  
    newOrder.save()
      .then((order) => {
        //console.log('Order saved:', order);
        
        publishOrderToQueue(order, res);
  
        res.status(201).json(order);
      })
      .catch((err) => {
        console.error('Error saving order:', err);
        res.status(500).json({ error: 'Error saving order' });
      });
  };
  

const getOrderById = async (req, res) => {
    const { orderId } = req.params;

    try {
        const cachedOrder = await redis.get(orderId);

        if (cachedOrder) {
            return res.status(200).json(JSON.parse(cachedOrder));
        }

        const currentOrder = await Order.findById(orderId);

        if (!currentOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await redis.set(orderId, JSON.stringify(currentOrder), 'EX', 1800); //Cache  30 min
        return res.status(200).json(currentOrder);

    } catch (error) {
        console.error('Error retrieving order:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
  
const getOrderLogs = async (req, res) => {
    const { orderId } = req.params;

    const logs = await getOrderLogsProvider(orderId);

    if (logs.length === 0) {
      return res.status(404).json({ error: 'No logs found for order: '.orderId });
    }

    return res.status(200).json(logs);
};

const router = express.Router();

router.post('/create-order', createOrder);
router.get('/orders/:orderId', getOrderById);
router.get('/logs/orders/:orderId', getOrderLogs);

module.exports = router;