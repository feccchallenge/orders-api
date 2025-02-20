require('dotenv').config();

const { Client } = require('@elastic/elasticsearch');

const ES_INDEX = process.env.ES_INDEX;

const clientES = new Client({ node: process.env.ELASTICSEARCH_URI, auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  },  requestTimeout: 30000,  // Adjust if needed for longer requests
    maxRetries: 5,         // Retry a few times in case of temporary issues
    sniffOnStart: true,    // Sniff on start can help auto-discover nodes in a cluster
    sniffInterval: 60000,  // Optional: Set an interval for sniffing
    snifferTimeout: 30000 });

async function logOrderEvent(order, status) {
    try {
      const logOrder = {
        orderId: order._id,
        createdAt: new Date(),
        status,
      };
      
      await clientES.index({
        index: ES_INDEX,
        body: logOrder,
      });
  
      console.log('Saving order event in ES');
    } catch (err) {
      console.error('Error logging to Elasticsearch:', err);
    }
  }

const getOrderLogsProvider = async (orderId) => {
  try {
    const { body } = await clientES.search({
      index: ES_INDEX,
      body: {
        query: {
          match: { orderId },
        },
      },
    });
    if (body.hits.total.value === 0) {
      return [];
    }

    return body.hits.hits.map(hit => hit._source);
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw new Error('Error fetching logs');
  }
};

module.exports = {
  logOrderEvent,
  getOrderLogsProvider,
};