**Node.js + Express project** 

📁 **src/**

* `controllers/` → API logic (auth, booking, bus, route)
* `models/` → Mongoose (or DB) schemas
* `routes/` → Express routes for each module
* `config/db.js` → Database connection
* Middleware for authentication (`authMiddleware.js`, `adminMiddleware.js`)

---

## 🚌 NextStop API Documentation

### 📘 Overview

NextStop is a RESTful API for a bus booking platform that includes:

* User authentication
* Bus and route management (admin)
* Booking and cancellation system
* JWT-based authentication middleware

---

## 🚀 Getting Started

### 1️⃣ Installation

```bash
git clone https://github.com/your-username/nextstop-backend.git
cd nextstop-backend
npm install
```

### 2️⃣ Setup Environment

Create a `.env` file in the root:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 3️⃣ Start Server

```bash
npm start
```

Server runs at: `http://localhost:5050/`

---

## 📂 Folder Structure

```
src/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── bookingController.js
│   ├── busController.js
│   └── routeController.js
├── models/
│   ├── User.js
│   ├── Bus.js
│   ├── Route.js
│   ├── Booking.js
│   ├── Feedback.js
│   └── Payment.js
├── models/middleware/
│   ├── authMiddleware.js
│   └── adminMiddleware.js
└── routes/
    ├── authRoutes.js
    ├── bookingRoutes.js
    ├── busRoutes.js
    └── routeRoutes.js
```

---

## 🔐 Authentication Routes (`/api/auth`)
---

## 🪪 Register User

**Method:** `POST`
**API:**

```bash
http://localhost:5050/api/auth/register
```

**JSON:**

```json
{
  "username": "john_doe1",
  "firstName": "John",
  "lastName": "Doe",
  "email": "udhyak9445@gmail.com",
  "mobileNo": "9871543211",
  "altMobileNo": "9444444224",
  "dob": "1992-03-12",
  "address": "12, MG Road, Madurai, TN",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "role": "user"
}
```

---

## 🔑 Login User

**Method:** `POST`
**API:**

```bash
http://localhost:5050/api/auth/login
```

**JSON:**

```json
{
  "username": "john_doe1",
  "email": "udhyak9445@gmail.com",
  "password": "Password@123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🔄 Forgot Password

**Method:** `POST`
**API:**

```bash
http://localhost:5050/api/auth/forgot-password
```

**JSON:**

```json
{
  "email": "udhyak9445@gmail.com"
}
```

**Response:**

```json
{
  "message": "Reset code sent to email"
}
```

---

## 🔁 Reset Password

**Method:** `POST`
**API:**

```bash
http://localhost:5050/api/auth/reset-password
```

**JSON:**

```json
{
  "email": "udhyak9445@gmail.com",
  "code": "964630",
  "newPassword": "12345"
}
```

**Response:**

```json
{
  "message": "Password reset successful"
}
```

---

Perfect ✅ Here’s your **GitHub-ready Bus API Documentation** — formatted exactly like your previous ones, including both public and admin-protected routes (with JWT header info).

---

# 🚌 Bus API Documentation

## 🚍 Get All Buses

**Method:** `GET`
**API:**

```bash
http://localhost:5050/api/buses/
```

**Response:**

```json
{
    "buses": [
        {
            "_id": "68f48c6b9cf5023393a42d6c",
            "busNumber": "TN01AB1234",
            "busName": "KPN Travels",
            "type": "AC",
            "routeId": "route1",
            "operatorName1": "Ravi Kumar",
            "operatorPhone1": "9898989898",
            "operatorName2": "Sankar",
            "operatorPhone2": "9876500000",
            "createdAt": "2025-10-19T06:59:55.622Z",
            "updatedAt": "2025-10-19T06:59:55.622Z",
            "route": {
                "routeId": "route1",
                "source": "Madurai",
                "destination": "Chennai",
                "distance": 460,
                "duration": "7h 30m"
            }
        }
    ]
}
```

---

## 🔍 Search Buses by Route & Type

**Method:** `GET`
**API:**

```bash
http://localhost:5050/api/buses/search?source=Madurai&destination=Chennai&type=AC
```

**Response:**

```json
{
    "buses": [
        {
            "busNumber": "TN01AB1234",
            "busName": "KPN Travels",
            "type": "AC",
            "routeId": "route1",
            "operatorName1": "Ravi Kumar",
            "operatorPhone1": "9898989898",
            "operatorName2": "Sankar",
            "operatorPhone2": "9876500000"
        }
    ]
}
```

---

## 🚌 Get Bus by Bus Number

**Method:** `GET`
**API:**

```bash
http://localhost:5050/api/buses/TN02CD5678
```

**Response:**

```json
{
    "bus": {
        "_id": "68f48c6b9cf5023393a42d6d",
        "busNumber": "TN02CD5678",
        "busName": "Parveen Travels",
        "type": "AC",
        "routeId": "route1",
        "operatorName1": "Suresh Kumar",
        "operatorPhone1": "9797979797",
        "operatorName2": null,
        "operatorPhone2": null,
        "createdAt": "2025-10-19T06:59:55.622Z",
        "updatedAt": "2025-10-19T06:59:55.622Z"
    }
}
```

---

# 🔒 Admin Protected Routes

> **Header Key:** `Authorization`
> **Header Value:** `Bearer <token>`

---

## ➕ Add Bus

**Method:** `POST`
**API:**

```bash
http://localhost:5050/api/buses/add
```

**JSON:**

```json
{
  "busNumber": "TN05GH3456",
  "busName": "Galaxy Travels",
  "type": "AC",
  "routeId": "route1",
  "operatorName1": "Arun Prakash",
  "operatorPhone1": "9881122334",
  "operatorName2": "Vikram Singh",
  "operatorPhone2": "9900112233"
}
```

**Response:**

```json
{
  "message": "Bus added successfully",
  "bus": {
    "_id": "68f5a9171eb8efa4a07eb23d",
    "busNumber": "TN05GH3456",
    "busName": "Galaxy Travels",
    "type": "AC",
    "routeId": "route1",
    "operatorName1": "Arun Prakash",
    "operatorPhone1": "9881122334",
    "operatorName2": "Vikram Singh",
    "operatorPhone2": "9900112233",
    "createdAt": "2025-10-20T03:14:31.681Z",
    "updatedAt": "2025-10-20T03:14:31.681Z"
  }
}
```

---

## ✏️ Update Bus

**Method:** `PUT`
**API:**

```bash
http://localhost:5050/api/buses/TN05GH3456
```

**JSON:**

```json
{
  "busNumber": "TN05GH3456",
  "busName": "Galaxy Travels 1",
  "type": "AC",
  "routeId": "route1",
  "operatorName1": "Arun Prakash",
  "operatorPhone1": "9881122334",
  "operatorName2": "Vikram Singh",
  "operatorPhone2": "9900112233"
}
```

**Response:**

```json
{
  "message": "Bus updated successfully",
  "bus": {
    "_id": "68f5a9171eb8efa4a07eb23d",
    "busNumber": "TN05GH3456",
    "busName": "Galaxy Travels 1",
    "type": "AC",
    "routeId": "route1",
    "operatorName1": "Arun Prakash",
    "operatorPhone1": "9881122334",
    "operatorName2": "Vikram Singh",
    "operatorPhone2": "9900112233",
    "createdAt": "2025-10-20T03:14:31.681Z",
    "updatedAt": "2025-10-20T03:25:59.009Z"
  }
}
```

---

## 🗑️ Delete Bus

**Method:** `DELETE`
**API:**

```bash
http://localhost:5050/api/buses/TN05GH3456
```

**Response:**

```json
{
  "message": "Bus deleted successfully"
}
```

---


# 🗺️ Routes API Documentation

## 🚏 Get All Routes

**Method:** `GET`
**API:**

```bash
http://localhost:5050/api/routes
```

**Response:**

```json
{
    "routes": [
        {
            "_id": "68f48c6b9cf5023393a42d67",
            "routeId": "route1",
            "source": "Madurai",
            "destination": "Chennai",
            "distance": 460,
            "duration": "7h 30m",
            "createdAt": "2025-10-19T06:59:55.590Z",
            "updatedAt": "2025-10-19T06:59:55.590Z"
        },
        {
            "_id": "68f48c6b9cf5023393a42d69",
            "routeId": "route3",
            "source": "Trichy",
            "destination": "Madurai",
            "distance": 135,
            "duration": "2h 15m",
            "createdAt": "2025-10-19T06:59:55.590Z",
            "updatedAt": "2025-10-19T06:59:55.590Z"
        }
    ]
}
```

---

## 🛤️ Get Route by Route ID

**Method:** `GET`
**API:**

```bash
http://localhost:5050/api/routes/route3
```

**Response:**

```json
{
    "route": {
        "_id": "68f48c6b9cf5023393a42d69",
        "routeId": "route3",
        "source": "Trichy",
        "destination": "Madurai",
        "distance": 135,
        "duration": "2h 15m",
        "createdAt": "2025-10-19T06:59:55.590Z",
        "updatedAt": "2025-10-19T06:59:55.590Z"
    }
}
```

---

# 🔒 Admin Protected Routes

> **Header Key:** `Authorization`
> **Header Value:** `Bearer <token>`

---

## ➕ Add Route

**Method:** `POST`
**API:**

```bash
http://localhost:5050/api/routes/add
```

**JSON:**

```json
{
  "routeId": "route4",
  "source": "Trichy",
  "destination": "Tenkasi",
  "distance": 370,
  "duration": "4h 15m"
}
```

**Response:**

```json
{
  "routeId": "route4",
  "source": "Trichy",
  "destination": "Tenkasi",
  "distance": 370,
  "duration": "4h 15m"
}
```

---

## ✏️ Update Route

**Method:** `PUT`
**API:**

```bash
http://localhost:5050/api/routes/route3
```

**JSON:**

```json
{
  "source": "Madurai",
  "destination": "Tenkasi",
  "distance": 410,
  "duration": "5h 10m"
}
```

**Response:**

```json
{
  "message": "Route updated successfully",
  "route": {
    "routeId": "route3",
    "source": "Madurai",
    "destination": "Tenkasi",
    "distance": 410,
    "duration": "5h 10m"
  }
}
```

---

## 🗑️ Delete Route

**Method:** `DELETE`
**API:**

```bash
http://localhost:5050/api/routes/route3
```

**Response:**

```json
{
  "message": "Route deleted successfully"
}
```
## Admin Dashboard is implemented separately
---
