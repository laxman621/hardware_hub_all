# HardwareHub Backend

## Overview
HardwareHub is a web application that allows users to buy and rent hardware tools, as well as hire professionals for various tasks. This backend project is built using Node.js, Express, and MySQL.

## Features
- User authentication (registration and login)
- Product management (add, update, retrieve products)
- Tool rental management (create rental requests, manage rentals)
- Professional management (add, update, retrieve professionals)
- Order management (create and retrieve orders for products and rentals)

## Tech Stack
- Node.js
- Express.js
- MySQL

## Project Structure
```
hardwarehub-backend
├── src
│   ├── app.js
│   ├── server.js
│   ├── config
│   │   └── database.js
│   ├── controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── rentalController.js
│   │   ├── professionalController.js
│   │   └── orderController.js
│   ├── models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Rental.js
│   │   ├── Professional.js
│   │   └── Order.js
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── rentalRoutes.js
│   │   ├── professionalRoutes.js
│   │   └── orderRoutes.js
│   ├── middlewares
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   └── utils
│       └── validation.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd hardwarehub-backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.
5. Start the server:
   ```
   npm start
   ```

## Usage
- The API endpoints can be accessed at `http://localhost:<port>`, where `<port>` is the port specified in your server configuration.
- Refer to the individual route files for specific API endpoints and their usage.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License
This project is licensed under the MIT License.