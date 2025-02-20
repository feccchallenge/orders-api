const amqp = require('amqplib/callback_api'); // Import RabbitMQ package

const RABBITMQ_URI = process.env.RABBITMQ_URI;
const ORDER_EVENTS_QUEUE = process.env.ORDER_EVENTS_QUEUE;

const publishOrderToQueue = (order, res) => {
  amqp.connect(RABBITMQ_URI, (err, connection) => {
    if (err) {
      console.error('Error connecting to RabbitMQ:', err);
      return res.status(500).json({ error: 'Failed to publish message' });
    }

    connection.createChannel((err, channel) => {
      if (err) {
        console.error('Error creating channel:', err);
        return res.status(500).json({ error: 'Failed to publish message' });
      }

      const message = JSON.stringify(order);

      channel.assertQueue(ORDER_EVENTS_QUEUE, { durable: true });
      channel.sendToQueue(ORDER_EVENTS_QUEUE, Buffer.from(message), { persistent: true });

      // Optionally log the published message
      // console.log('Message published to queue:', message);
    });

    setTimeout(() => connection.close(), 300);
  });
};

module.exports = { publishOrderToQueue };
