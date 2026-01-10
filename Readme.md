# 🖥️ EventsVibe — Events Management System Server

A lightweight, secure, and fully structured backend API for the **Event Management Website**, built with **Node.js**, **Express**, **TypeScript**, and **Postgresql** with **Prisma**.

# 🌐 Live Link
[https://events-management-system-server.onrender.com/](https://events-management-system-server.onrender.com/)

## 🚀 Features

### 🔐 Authentication & Authorization
- 🎯 Secure Password Hashing using bcrypt

### 🧱 Clean Architecture
- MVC pattern with modular folder structure  
- Centralized error handling and response formatting

### 🔐 API Security
- CORS enabled

# 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **Postgresql + Prisma**
- **dotenv**
- **CORS**
- **Postman** for API testing
- **Vercel** for deployment

---

# 📁 Project Structure

```txt
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── app/
│   ├── generated/
│   ├── modules/
│   ├── app.ts
│   └── server.ts
├── package.json
├──  Backend Events Management APIs.postman_collection.json
├── tsconfig.json
└── vercel.json

```
## 🔍 Notes

- Backend uses Node.js + Express + Prisma + TypeScript
- Contains Prisma schema and migration folder
- src/modules contains feature-wise modular logic
- generated/likely Prisma client
- Includes Postman collection 


## 📡 API Endpoints

### 🔐 Auth
- `POST /api/v1/auth/login` Login with email & password
- `POST /api/v1/auth/google` Login with Google
- `POST /api/v1/auth/refresh-token` Refresh access token
- `POST /api/v1/auth/forgot-password` Send password reset email
- `POST /api/v1/auth/reset-password` Reset password using token
---

### 👤 Users
- `POST /api/v1/user/register` Register a new user (with avatar upload)
- `GET /api/v1/user/me` Get logged-in user profile
- `GET /api/v1/user` Get all users
- `GET /api/v1/user/:id` Get single user by ID
- `PATCH /api/v1/user/:id` Update user profile
- `DELETE /api/v1/user/:id` Delete user
---

### 🧑‍💼 Hosts
- `POST /api/v1/host/request` Request to become a host
- `PATCH /api/v1/host/:id` Update host request
- `PATCH /api/v1/host/approve/:id` Approve host request (Admin)
- `GET /api/v1/host` Get all hosts (Admin)
---

### 📅 Events
- `GET /api/v1/event` Get all events
- `GET /api/v1/event/me` Get my events
- `GET /api/v1/event/:id` Get single event
- `POST /api/v1/event` Create a new event (Host)
- `POST /api/v1/event/suggestion` Get AI event suggestions
- `PATCH /api/v1/event/:id` Update event
- `DELETE /api/v1/event/:id` Delete event
---

### 💳 Payments
- `POST /api/v1/payment/create-session` Create Stripe checkout session
---

### 📊 Metadata
- `GET /api/v1/metadata` Get dashboard metadata
---

### 🤝 Social

Friend System
- `POST /api/v1/social/friend` Send friend request
- `GET /api/v1/social/friend` Get friend requests
- `PATCH /api/v1/social/friend` Accept or reject friend request
---

Follow System
- `POST /api/v1/social/follow` Follow a user
- `GET /api/v1/social/follow` Get follow list
---

Saved Events
- `POST /api/v1/social/save` Save an event
- `GET /api/v1/social/save` Get saved events
---

Reviews
- `POST /api/v1/social/review` Create a review
- `GET /api/v1/social/review` Get event reviews
---

Notifications
- `GET /api/v1/social/notifications` Get notifications
- `PATCH /api/v1/social/notifications/:id/read` Mark notification as read
---

## 🧹 Code Quality
- TypeScript interfaces for type safety.
- Centralized error handling.

## ✅ Status
Project is functional and under active development.