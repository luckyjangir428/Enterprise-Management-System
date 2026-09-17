# PERN ERP – Enquiry to Dispatch Management System

A full-stack ERP application built using the **PERN stack (PostgreSQL, Express.js, React.js, Node.js)**.

The system manages the complete business workflow:

**Customer Enquiry → Quotation → Sales Order → Inventory Reservation → Dispatch**

---

## Features

### Authentication & Authorization

* JWT-based authentication
* Password hashing using bcrypt
* Protected API routes
* Role-based access control
* Two user roles:

  * `ADMIN`
  * `USER`

### Customer & Enquiry Management

* Create customers/enquiries
* Add multiple products to an enquiry
* Specify product quantities
* Track enquiry status
* View enquiry details

### Quotation Management

* Create quotations from enquiries
* Add multiple quotation items
* Automatic backend calculation of:

  * Base amount
  * Discount
  * GST
  * Final total
* Quotation workflow:

  * `DRAFT`
  * `SENT`
  * `ACCEPTED`
  * `REJECTED`
* Accepted quotations can be converted into Sales Orders
* Prevents duplicate Sales Orders for the same quotation

### Sales Order Management

* Convert accepted quotations into Sales Orders
* Sales Order workflow:

  * `PENDING`
  * `CONFIRMED`
  * `DISPATCHED`
  * `CANCELLED`
* Admin can confirm Sales Orders
* Inventory is reserved during confirmation
* Backend validates inventory availability
* Prevents over-reservation

### Inventory Management

* Product master
* Physical inventory
* Reserved inventory
* Available inventory
* Prevents negative inventory
* Prevents reservation beyond available stock
* Dispatch decreases physical and reserved inventory

### Dispatch Management

* Admin-only dispatch operation
* Vehicle number and driver details
* Prevents duplicate dispatch
* Prevents dispatch beyond reserved quantity
* Updates Sales Order status to `DISPATCHED`

---

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* JavaScript
* Fetch API

### Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcrypt
* Jest
* Supertest

### Database

* PostgreSQL
* `pg` Node.js driver
* Relational database design
* Foreign keys
* Unique constraints
* Check constraints
* Database transactions

---

## Project Structure

```text
pern-erp/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── tests/
│   │   ├── quotationCalculator.test.js
│   │   ├── salesOrder.test.js
│   │   ├── inventory.test.js
│   │   └── rbac.test.js
│   │
│   ├── schema.sql
│   ├── seed.sql
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Prerequisites

Install the following before running the project:

* Node.js
* npm
* PostgreSQL
* Git

---

## Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE pern_erp;
```

Connect to the database and execute:

```text
backend/schema.sql
```

Then execute:

```text
backend/seed.sql
```

The seed file creates sample users, products, inventory, customers, enquiries and quotations.

---

## Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=5000

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/pern_erp

JWT_SECRET=your_super_secret_key_change_this
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

**Do not commit `.env` to Git.**

---

## Backend Setup

Open a terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Health check:

```text
GET /api/health
```

---

## Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on the Vite development server, normally:

```text
http://localhost:5173
```

---

## Test Credentials

### Admin

```text
Email: admin@example.com
Password: Admin@123
Role: ADMIN
```

### Sales User

```text
Email: sales@example.com
Password: Sales@123
Role: USER
```

These are demonstration credentials for the seeded development database.

---

## API Overview

### Authentication

```text
POST /api/auth/login
```

### Customers

```text
GET  /api/customers
POST /api/customers
```

### Enquiries

```text
GET  /api/enquiries
GET  /api/enquiries/:id
POST /api/enquiries
```

### Quotations

```text
GET   /api/quotations
POST  /api/quotations
PATCH /api/quotations/:id/status
POST  /api/quotations/:id/convert
```

### Sales Orders

```text
GET  /api/sales-orders
GET  /api/sales-orders/:id
POST /api/sales-orders/:id/confirm
POST /api/sales-orders/:id/dispatch
POST /api/sales-orders/:id/cancel
```

### Products & Inventory

```text
GET /api/products
GET /api/inventory
```

---

## Business Workflow

```text
Customer
   │
   ▼
Enquiry
   │
   ▼
Quotation
   │
   ├── DRAFT
   │
   ├── SENT
   │
   ├── ACCEPTED
   │
   └── REJECTED
          │
          ▼
    Sales Order
          │
          ▼
      CONFIRMED
          │
          ▼
Inventory Reservation
          │
          ▼
       Dispatch
          │
          ▼
     DISPATCHED
```

---

## Role Permissions

| Operation                | ADMIN | USER |
| ------------------------ | ----: | ---------: |
| View enquiries           |     ✓ |          ✓ |
| Create enquiries         |     ✓ |          ✓ |
| Create quotations        |     ✓ |          ✓ |
| Accept/Reject quotations |     ✓ |          ✓ |
| Convert quotation to SO  |     ✓ |          ✓ |
| View inventory           |     ✓ |          ✓ |
| Confirm Sales Order      |     ✓ |          ✗ |
| Dispatch Sales Order     |     ✓ |          ✗ |
| Cancel confirmed order   |     ✓ |          ✗ |

Authorization is enforced on the **backend**, not only through the frontend.

---

## Automated Tests

The project includes automated tests covering important business rules:

1. Quotation total calculation
2. Draft quotation cannot create a Sales Order
3. Same quotation cannot create multiple Sales Orders
4. Inventory cannot be reserved beyond available quantity
5. Unauthorized Sales User cannot perform an admin-only operation

Run all tests:

```bash
npm test
```

---

## Error Handling

The backend provides centralized error handling and returns appropriate HTTP status codes for:

* Authentication failures
* Authorization failures
* Invalid requests
* Missing resources
* Business rule violations
* Duplicate operations
* Database errors

---

## Security

The application implements:

* JWT authentication
* bcrypt password hashing
* Protected API routes
* Backend role-based authorization
* Environment variables for configuration
* Database constraints
* Transaction-based workflow operations

---

## Database Design

The application uses relational PostgreSQL tables for:

* Users
* Customers
* Products
* Inventory
* Enquiries
* Enquiry Items
* Quotations
* Quotation Items
* Sales Orders
* Sales Order Items
* Dispatches

Foreign keys and constraints maintain relationships and data consistency.

Critical inventory and Sales Order operations use database transactions and row-level locking where required.

---

## Development

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

### Tests

```bash
cd backend
npm test
```

---

## Future Improvements

Possible future enhancements include:

* Swagger/Open
