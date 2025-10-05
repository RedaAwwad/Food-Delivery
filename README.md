# Food Delivery API

A RESTful API for a food delivery application built with Node.js, Express, and TypeScript. This API provides cart management functionality for customers to add, modify, and manage their food orders.

## 🚀 Features

- **Cart Management**: Add, remove, update, and clear items from shopping cart
- **Quantity Updates**: Update item quantities in the cart
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Docker Support**: Containerized application with PostgreSQL database
- **TypeScript**: Full TypeScript support for better development experience

## 📋 API Endpoints

### Cart Operations

| Method   | Endpoint                               | Description                                 |
| -------- | -------------------------------------- | ------------------------------------------- |
| `GET`    | `/api/v1/cart/view`                    | View cart contents                          |
| `PUT`    | `/api/v1/cart/modify`                  | Modify cart (add/remove/update/clear items) |
| `PUT`    | `/api/v1/cart/:itemId/update-quantity` | Update item quantity                        |
| `DELETE` | `/api/v1/cart/clear`                   | Clear entire cart                           |

### API Documentation

Visit `http://localhost:4000/api-docs` for interactive API documentation powered by Swagger UI.

## 🛠️ Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## 📦 Installation

### Prerequisites

- Node.js 20 or higher
- Docker and Docker Compose (for containerized setup)
- npm or yarn

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/RedaAwwad/Food-Delivery.git
   cd Food-Delivery
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   PORT=4000
   # Add other environment variables as needed
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Generate Swagger documentation**
   ```bash
   npm run swagger
   ```

The API will be available at `http://localhost:4000`

### Docker Setup

1. **Start the application with Docker Compose**
   ```bash
   docker-compose up --build
   ```

This will start:

- Express API server on port 4000
- PostgreSQL database
- Automatic volume mounting for development

## 🏗️ Project Structure

```
src/
├── Controller/
│   └── cart.controller.ts    # Cart API endpoints
├── Service/
│   └── cart.service.ts       # Business logic layer
├── Repository/
│   └── cart.repository.ts    # Data access layer
├── entity/
│   └── cart.entity.ts        # Data models
├── swagger/
│   ├── swagger.ts            # Swagger configuration
│   └── swagger-output.json   # Generated API docs
└── server.ts                 # Application entry point
```

## 🚀 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript project
- `npm start` - Start the production server
- `npm run swagger` - Generate Swagger documentation

## 📝 API Usage Examples

### View Cart

```bash
curl -X GET http://localhost:4000/api/v1/cart/view
```

### Modify Cart

```bash
curl -X PUT http://localhost:4000/api/v1/cart/modify \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 123,
    "cartItem": {
      "itemId": 1,
      "quantity": 2
    },
    "action": "add"
  }'
```

### Update Item Quantity

```bash
curl -X PUT http://localhost:4000/api/v1/cart/1/update-quantity \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "abc123",
    "quantity": 3
  }'
```

### Clear Cart

```bash
curl -X DELETE http://localhost:4000/api/v1/cart/clear \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "abc123"
  }'
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build node-app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Links

- **Repository**: [https://github.com/RedaAwwad/Food-Delivery](https://github.com/RedaAwwad/Food-Delivery)
- **Issues**: [https://github.com/RedaAwwad/Food-Delivery/issues](https://github.com/RedaAwwad/Food-Delivery/issues)

## 📞 Support

If you have any questions or need help, please open an issue in the GitHub repository.
