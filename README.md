# ✨ NexusFlow - Modern Team Workspace

![NexusFlow Banner](https://img.shields.io/badge/Status-Active-success) ![Stack](https://img.shields.io/badge/Stack-MERN-blue) ![License](https://img.shields.io/badge/License-MIT-purple)

NexusFlow is a premium, fully-featured team task management application built on the MERN stack. It moves beyond traditional flat designs to offer a highly polished, interactive, "glassmorphic" user interface. Designed for modern teams, NexusFlow allows you to create projects, assign tasks, and track team progress with elegant visual boards.

---

## 🌟 Key Features

### 1. Premium Glassmorphic UI/UX
- **Modern Aesthetic**: Replaces rigid borders and flat colors with beautiful frosted glass effects (`backdrop-filter`), vibrant gradients, and clean typography (Inter).
- **Floating Components**: Intuitive floating top navigation, bento-grid dashboard, and card-based Kanban boards that respond smoothly to interactions.
- **Dynamic Feedback**: Micro-animations and hover effects that make the workspace feel alive.

### 2. Role-Based Access Control
- **Admin Roles**: Complete control over workspaces. Initialize new projects, manage team member access, create tasks, and delete items.
- **Member Roles**: Focused, read/write access to assigned projects. Update task statuses and collaborate without administrative overhead.

### 3. Interactive Task Management
- **Visual Kanban Board**: Drag-and-drop aesthetic task management sorted by To-Do, In Progress, and Completed.
- **Priority & Due Dates**: Color-coded priority indicators and intelligent overdue alerts so nothing falls through the cracks.
- **Bento Dashboard**: At-a-glance metrics, quick-access priority tasks, and a visual representation of active horizons.

### 4. Project Portfolios
- **Project Overviews**: Beautiful grid layouts for all active projects showing completion percentages and team sizes.
- **Team Directory**: Specialized dashboard to view the entire organization and manage access levels seamlessly.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router v6, Axios, Custom Vanilla CSS (Glassmorphism & Flex/Grid)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas Cloud) with Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs for secure password hashing

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas Cluster (or local MongoDB)

### 1. Installation

Clone the repository and install dependencies for both the backend and frontend:

```bash
git clone https://github.com/Bajaj2312/task-manager-.git
cd task-manager-

# Install Backend
cd backend
npm install

# Install Frontend
cd ../frontend
npm install
```

### 2. Configuration

In the `backend` directory, create a `.env` file and provide your connection strings:

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0...
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:3000
```

### 3. Running Locally

You will need to run both the backend and frontend servers simultaneously.

**Start the Backend (API)**
```bash
cd backend
npm run dev
```

**Start the Frontend (UI)**
```bash
cd frontend
npm start
```

Navigate to `http://localhost:3000` to access your NexusFlow workspace!

---

## 👥 Demo Setup

After initializing the application, create two accounts to test the role-based functionality. You can promote the first user to an `admin` directly through the database, or the first registered user may be granted admin rights depending on your setup. 

Recommended testing flow:
- **Admin**: `admin@demo.com` - Create projects, invite users, and assign tasks.
- **Member**: `member@demo.com` - Log in to update assigned tasks.
