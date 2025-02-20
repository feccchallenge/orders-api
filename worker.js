require('dotenv').config();

const amqp = require('amqplib/callback_api');
const mongoose = require('mongoose');
const { logOrderEvent } = require('./app-logs/logsProviderStorage');
const Order = require('./app-domain/Order');

const RABBITMQ_URI = process.env.RABBITMQ_URI;
const ORDER_EVENTS_QUEUE = process.env.ORDER_EVENTS_QUEUE;
const MONGO_URI = process.env.MONGO_URI;
const ORDER_PROCESSING_STATUS = "PROCESSING";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

const rabbitStartConn = () => {
    amqp.connect(RABBITMQ_URI, (err, conn) => {
        if (err) {
            if (err.message.includes('Connection closed') || err.message.includes('connect ECONNREFUSED')) {
                console.error('Connection closed, reconnecting...');
                setTimeout(connectRabbit, 10000);
            } else {
                console.error('Connection error:', err.message);
                return;
            }
        }
  
        conn.createChannel((err, channel) => {
            if (err) {
                console.error('Error creating channel:', err);
                return;
            }
        
            channel.assertQueue(ORDER_EVENTS_QUEUE, { durable: true });
            console.log(`Waiting for messages from ${ORDER_EVENTS_QUEUE}`);
        
            channel.consume(ORDER_EVENTS_QUEUE, async (msg) => {
                if (msg !== null) {
                    const order = JSON.parse(msg.content.toString());
                    try {
                        const currentOrder = await Order.findByIdAndUpdate(
                            order._id,
                            { status: ORDER_PROCESSING_STATUS},
                            { new: true }
                            );                            
                        
                        await logOrderEvent(currentOrder, ORDER_PROCESSING_STATUS);

                        const postProcessingStatus = Math.random() > 0.5 ? 'COMPLETED' : 'FAILED'; // random order status selection                                        

                        currentOrder.status = postProcessingStatus;

                        await currentOrder.save();
                        
                        console.log('Order final status :', currentOrder);
                        await logOrderEvent(currentOrder, postProcessingStatus);
                    } catch (err) {
                        console.error('Error updating order: ', err);
                    }
            
                    channel.ack(msg);
                }
            });
        });
    });
}

rabbitStartConn();