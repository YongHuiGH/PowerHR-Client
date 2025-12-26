# PowerHR Mock Backend

Simple authentication backend for local development with MongoDB.

## Prerequisites

- Node.js installed
- MongoDB installed locally OR MongoDB Atlas account

## Setup

1. Install dependencies:
```bash
cd mock-backend
npm install
```

2. Configure MongoDB connection:
   - Edit `.env` file
   - For **local MongoDB**: Use `MONGODB_URI=mongodb://localhost:27017/powerhr`
   - For **MongoDB Atlas**: Use your connection string from Atlas

3. Start MongoDB (if using local):
```bash
mongod
```

4. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## Features

- ✅ User registration (no email verification needed)
- ✅ User login with password hashing (bcrypt)
- ✅ MongoDB database (persistent storage)
- ✅ Auto-verified accounts
- ✅ CORS enabled

## Endpoints

- `POST /auth/register/applicant` - Register new user
- `POST /auth/login` - Login user
- `GET /health` - Health check
- `GET /debug/users` - View all registered users

## Usage

1. Register a user through the frontend
2. Login with the same credentials
3. No email verification needed!

## MongoDB Setup Options

### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB: `mongod`
3. Use: `MONGODB_URI=mongodb://localhost:27017/powerhr`

### Option 2: MongoDB Atlas (Cloud)
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Update `.env` with your connection string

## Note

This is a simplified mock backend for development only. Data persists in MongoDB.
