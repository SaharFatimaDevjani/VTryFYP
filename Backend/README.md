# Ecom Node Backend

A Node.js backend application for an e-commerce/auction platform built with Express.js and MongoDB.

## Features

- User Authentication (Register/Login with JWT)
- Product Management
- Category Management
- Bid Management
- Wishlist Functionality
- File Upload Support
- Protected Routes with Authentication Middleware

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
CORS_ORIGIN=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

4. Start the development server:
```bash
npm run dev
```

Or for production:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/counters` - Get product counters by category
- `POST /api/products` - Create product (Protected)
- `PUT /api/products/:id` - Update product (Protected)
- `DELETE /api/products/:id` - Delete product (Protected)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Protected)
- `PUT /api/categories/:id` - Update category (Protected)
- `DELETE /api/categories/:id` - Delete category (Protected)

### Bids
- `GET /api/bids` - Get all bids
- `GET /api/bids/grouped` - Get bids grouped by product
- `GET /api/bids/product/:product` - Get bids for a specific product
- `GET /api/bids/top-bidders` - Get top bidders
- `GET /api/bids/:productId` - Get bids by product ID
- `POST /api/bids` - Create bid (Protected)
- `POST /api/bids/wishlist` - Add to wishlist (Protected)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Protected)
- `PUT /api/users/:id` - Update user (Protected)
- `DELETE /api/users/:id` - Delete user (Protected)

### Upload
- `POST /api/upload` - Upload file (multipart/form-data)

## Testing

### Running API Tests

The project includes a comprehensive PowerShell test script to test all API endpoints.

#### Prerequisites
- PowerShell (Windows) or PowerShell Core (Cross-platform)
- Server must be running on `http://localhost:5000`

#### Running Tests

1. Make sure the server is running:
```bash
npm run dev
```

2. Run the test script:
```bash
powershell -ExecutionPolicy Bypass -File test\test-apis.ps1
```

Or navigate to the test folder and run:
```bash
cd test
powershell -ExecutionPolicy Bypass -File test-apis.ps1
```

#### What the Test Script Does

The test script automatically tests:
- ✅ Root endpoint
- ✅ User registration and login
- ✅ All public GET endpoints (categories, products, users, bids)
- ✅ All protected POST endpoints (create category, product, bid, wishlist)
- ✅ Product and bid retrieval by ID

The script will:
- Create a test user account
- Obtain authentication token
- Test all public endpoints
- Test all protected endpoints with authentication
- Display a summary of passed/failed tests

#### Expected Output

You should see:
- Individual test results with status (Success/Error)
- Authentication token received
- Test summary with total tests, passed, and failed counts
- Detailed error messages for any failed tests

## Project Structure

```
VTryBack/
├── config/
│   ├── database.js      # MongoDB connection
│   └── email.js         # Email configuration
├── controllers/
│   ├── authController.js
│   ├── bidController.js
│   ├── categoryController.js
│   ├── productController.js
│   └── userController.js
├── middleware/
│   └── authMiddleware.js # JWT authentication
├── models/
│   ├── Bid.js
│   ├── Category.js
│   ├── Product.js
│   ├── User.js
│   └── Wishlist.js
├── routes/
│   ├── authRoutes.js
│   ├── bidRoutes.js
│   ├── categoryRoutes.js
│   ├── productRoutes.js
│   └── userRoutes.js
├── test/
│   └── test-apis.ps1    # API testing script
├── uploads/             # Uploaded files
├── server.js            # Main server file
└── package.json
```

## Development

### Adding New Endpoints

1. Create/update model in `models/` if needed
2. Create/update controller in `controllers/`
3. Create/update route in `routes/`
4. Register route in `server.js`
5. Update test script in `test/test-apis.ps1` to include new endpoint

## License

ISC
