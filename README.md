# FlowDesk — Agile Project Management Platform

FlowDesk is a **full-stack Agile project management platform** built using the **MERN stack**. It enables teams to efficiently manage projects, track issues, organize sprints, and visualize development progress through **Kanban boards and burndown charts**.

The platform focuses on **real-time collaboration, structured workflow management, and data-driven sprint planning**, making it suitable for modern agile development environments.

---

## Live Application

**Frontend Application**
https://flowdesk-frontend-vanishaa08s-projects.vercel.app

**Backend API Health Check**
https://flowdesk-backend-6rjv.onrender.com/health

---

## Key Features

### Authentication & Security

* JWT-based authentication with **access and refresh tokens**
* Secure password hashing using **bcrypt**
* Protected routes and session handling

### Project Management

* Create, update, and delete projects
* Manage project members and tasks
* Organize development workflows efficiently

### Issue Tracking

* Full **CRUD operations** for issues
* Story point estimation using **Fibonacci scale (1, 2, 3, 5, 8, 13, 21)**
* Issue status tracking across workflow stages

### Kanban Board

* Interactive **drag-and-drop interface**
* Implemented using **@dnd-kit**
* Visual workflow management for development tasks

### Sprint Management

* Create and configure development sprints
* Start and complete sprint cycles
* Track sprint progress and backlog movement

### Data Visualization

* **Burndown charts** for sprint progress analysis
* Visualization built using **Recharts**

### Real-Time Collaboration

* **Socket.io** powered real-time updates
* Online user indicators on the Kanban board

### User Interface

* Modern responsive UI
* **Dark theme inspired by Supabase design**

---

## Technology Stack

### Backend

| Technology        | Purpose                               |
| ----------------- | ------------------------------------- |
| Node.js           | Server runtime                        |
| Express.js        | REST API framework                    |
| MongoDB           | NoSQL database                        |
| Mongoose          | Object Data Modeling (ODM)            |
| JWT               | Authentication and session management |
| bcrypt            | Password hashing                      |
| Socket.io         | Real-time communication               |
| Winston           | Logging and monitoring                |
| express-validator | Request validation                    |

### Frontend

| Technology        | Purpose                    |
| ----------------- | -------------------------- |
| React             | UI library                 |
| Vite              | Frontend build tool        |
| Redux Toolkit     | Global state management    |
| Material UI (MUI) | UI component library       |
| React Hook Form   | Form handling              |
| Zod               | Schema-based validation    |
| @dnd-kit          | Drag and drop interactions |
| Recharts          | Data visualization         |
| Socket.io Client  | Real-time communication    |
| Axios             | HTTP request handling      |

---

## Local Development Setup

### Prerequisites

* Node.js (version 18 or later)
* MongoDB installed locally or accessible via a cloud instance

---

## 1. Clone the Repositories

```bash
git clone https://github.com/Vanishaa08/flowdesk-backend
git clone https://github.com/Vanishaa08/flowdesk-frontend
```

---

## 2. Backend Setup

Navigate to the backend directory and install dependencies.

```bash
cd flowdesk-backend
npm install
```

Create a `.env` file in the root directory and configure the following environment variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flowdesk
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Start the backend development server:

```bash
npm run dev
```

---

## 3. Frontend Setup

Navigate to the frontend directory and install dependencies.

```bash
cd flowdesk-frontend
npm install
```

Create a `.env` file and configure the API base URL.

```
VITE_API_URL=http://localhost:5000/api
```

Run the frontend development server:

```bash
npm run dev
```

---

## 4. Access the Application

Open the application in your browser:

```
http://localhost:3000
```

---

## Project Structure

### Backend Architecture

```
flowdesk-backend
│
├── server.js
└── src
    ├── config
    │   └── database.js
    │
    ├── controllers
    │   ├── authController.js
    │   ├── projectController.js
    │   ├── issueController.js
    │   └── sprintController.js
    │
    ├── models
    │   ├── User.js
    │   ├── Project.js
    │   ├── Issue.js
    │   └── Sprint.js
    │
    ├── routes
    │   ├── auth.js
    │   ├── projects.js
    │   ├── issues.js
    │   └── sprints.js
    │
    ├── middleware
    │   ├── auth.js
    │   ├── errorHandler.js
    │   └── rateLimiter.js
    │
    └── utils
        ├── logger.js
        └── generateToken.js
```

---

### Frontend Architecture

```
flowdesk-frontend
└── src
    ├── components
    │   ├── kanban
    │   ├── issues
    │   ├── projects
    │   └── layout
    │
    ├── pages
    │   ├── HomePage.jsx
    │   ├── ProjectsPage.jsx
    │   ├── KanbanPage.jsx
    │   ├── SprintPage.jsx
    │   └── BurndownPage.jsx
    │
    ├── store
    │   └── slices
    │
    ├── services
    └── utils
```

---

## REST API Endpoints

### Authentication

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh-token
```

### Projects

```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Issues

```
GET    /api/projects/:projectId/issues
POST   /api/projects/:projectId/issues
PUT    /api/projects/:projectId/issues/:issueId
DELETE /api/projects/:projectId/issues/:issueId
PATCH  /api/projects/:projectId/issues/:issueId/status
```

### Sprints

```
GET    /api/projects/:projectId/sprints
POST   /api/projects/:projectId/sprints
PATCH  /api/projects/:projectId/sprints/:sprintId/start
PATCH  /api/projects/:projectId/sprints/:sprintId/complete
GET    /api/projects/:projectId/sprints/:sprintId/burndown
```

---

## Deployment

| Component | Platform      |
| --------- | ------------- |
| Frontend  | Vercel        |
| Backend   | Render        |
| Database  | MongoDB Atlas |

---

## Author

**Vanisha Tanwar**

GitHub:
https://github.com/Vanishaa08

Institution:
Netaji Subhas University of Technology (NSUT), Delhi

---

## License

This project is licensed under the **MIT License**.
