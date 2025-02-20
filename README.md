# Description

This is a backend application that manages an order system and processes events asynchronously.

Here is explained how to use the endpoints to allow users to create, get and get the logs generated for the orders in the process.

Also is included a **orders-app.postman_collection.json** file to allow import it and test the app functionality.

---

## Topics
1. [Endpoints](#endpoints)
2. [Instructions of Usage](#instructions-of-usage)
   - [Create Order](#create-order)
   - [Get Order Detail](#get-order-detail-info)
   - [Get Order Logs](#get-order-processing-logs)

---

## Endpoints

1. **Create Order**  
   - **URL**: `/orders`  
   - **Method**: `POST`  
   - **Description**: Creates an order with some basic data (detailed next below).

2. **Get Order Detail**  
   - **URL**: `/orders/:orderId`  
   - **Method**: `GET`  
   - **Description**: Returns the detail of an specific order by ID.

3. **Get Order Logs**  
   - **URL**: `/logs/orders/:orderId`  
   - **Method**: `GET`  
   - **Description**: Returns the logs generated for an specific order, by ID.

---

## Instructions of Usage

### Create Order

**Request**  
- **URL**: `/orders`  
- **Method**: `POST`  
- **Request Body** (JSON format):  
  ```json
  {
    "userId": "11111",
    "products": [
      { "productId": "p_1", "quantity": 3 },
      { "productId": "p_2", "quantity": 5 }
    ]
  }


### Get Order Detail Info
**Request**  

- **URL**: `/orders/:orderId`
- **Method**: `GET`
- **Path Parameter**: `orderId (string): The ID of the order. Example: 53b1c579bdf3de74f76bdac9``

### Get Order processing logs
**Request**  

 **URL**: `/logs/orders/:orderId`
- **Method**: `GET`
- **Path Parameter**: `orderId (string): The order identifier. Example: 53b1c579bdf3de74f76bdac9`


# Minimum tools required

- Docker compose

# Run the app

- execute the follow command on the project root folder

    ```console
    docker compose up -d
the server will respond from http://localhost:3000
