================================================================
TASKFLOW - Team Task Manager
Full-Stack Web Application | MERN Stack
================================================================

OVERVIEW
--------
TaskFlow is a full-stack team task management application built with
the MERN stack (MongoDB, Express.js, React, Node.js). It enables
teams to create projects, assign tasks, and track progress with
role-based access control (Admin / Member).

TECH STACK
----------
Frontend  : React 18, React Router v6, Axios, CSS Variables
Backend   : Node.js, Express.js, MongoDB, Mongoose
Auth      : JWT (JSON Web Tokens), bcryptjs
Deployment: Railway (backend + MongoDB) + Railway (frontend)

KEY FEATURES
------------
1. AUTHENTICATION
   - User signup and login with JWT tokens
   - Passwords hashed with bcryptjs
   - Protected routes on both frontend and backend
   - Role selection during signup (Admin / Member)

2. ROLE-BASED ACCESS CONTROL
   - Admin: Create/delete projects, create/assign/delete tasks,
            add members, manage user roles
   - Member: View projects they belong to, update status of
             tasks assigned to them

3. PROJECT MANAGEMENT
   - Create, view, and update projects (Admin only)
   - Add members to projects by email
   - Track project status (active, completed, archived)
   - Project due dates

4. TASK MANAGEMENT
   - Create tasks within projects (Admin only)
   - Assign tasks to project members
   - Set priority (low, medium, high)
   - Set due dates with automatic overdue detection
   - Update task status (todo, in-progress, completed)
   - Delete tasks (Admin only)

5. DASHBOARD
   - Live stats: total tasks, in-progress, completed, overdue
   - Recent tasks across all projects
   - Active projects with progress bars

6. KANBAN BOARD VIEW
   - Visual board with To Do / In Progress / Completed columns
   - Color-coded priority and overdue indicators

7. LIST VIEW
   - Tabular view of all project tasks
   - Filter by status visible at a glance

8. TEAM VIEW
   - See all project members with their roles

API ENDPOINTS
-------------
Auth:
  POST   /api/auth/signup        Register new user
  POST   /api/auth/login         Login
  GET    /api/auth/me            Get current user

Projects:
  GET    /api/projects           Get all projects (for current user)
  POST   /api/projects           Create project (admin)
  GET    /api/projects/:id       Get single project
  PUT    /api/projects/:id       Update project
  POST   /api/projects/:id/members  Add member
  DELETE /api/projects/:id       Delete project + all its tasks

Tasks:
  GET    /api/tasks              Get all tasks (across projects)
  GET    /api/tasks/project/:id  Get tasks for specific project
  POST   /api/tasks              Create task (admin)
  PUT    /api/tasks/:id          Update task (admin full, member status only)
  DELETE /api/tasks/:id          Delete task (admin)

Users:
  GET    /api/users              Get all users
  GET    /api/users/:id          Get single user
  PUT    /api/users/:id          Update user / change role (admin)

DATABASE SCHEMA
---------------
User:
  name, email (unique), password (hashed), role (admin/member), timestamps

Project:
  name, description, owner (ref: User), members [{user, role}],
  status (active/completed/archived), dueDate, timestamps

Task:
  title, description, project (ref: Project), assignedTo (ref: User),
  createdBy (ref: User), status (todo/in-progress/completed),
  priority (low/medium/high), dueDate, isOverdue (virtual), timestamps

SETUP INSTRUCTIONS (Local Development)
---------------------------------------
Prerequisites: Node.js 18+, MongoDB (local or Atlas)

1. Clone the repository:
   git clone <your-repo-url>
   cd team-task-manager

2. Setup Backend:
   cd backend
   npm install
   cp .env.example .env
   # Edit .env: set MONGO_URI and JWT_SECRET
   npm run dev       # runs on http://localhost:5000

3. Setup Frontend:
   cd frontend
   npm install
   npm start         # runs on http://localhost:3000

DEPLOYMENT (Railway)
--------------------
Backend:
  1. Push code to GitHub
  2. Create new project on railway.app
  3. Add MongoDB plugin (or use MongoDB Atlas)
  4. Set environment variables:
       MONGO_URI    = <your mongodb connection string>
       JWT_SECRET   = <a long random secret>
       FRONTEND_URL = <your frontend railway URL>
  5. Deploy from GitHub repo (root: /backend)
  6. Railway auto-detects Node.js and runs npm start

Frontend:
  1. Create another Railway service
  2. Set environment variable:
       REACT_APP_API_URL = <your backend railway URL>/api
  3. Deploy from GitHub repo (root: /frontend)
  4. Railway runs: npm run build and serves static files

DEMO CREDENTIALS
----------------
After creating accounts, the first admin can manage roles via Users page.
Recommended test setup:
  Admin  : admin@demo.com  / admin123
  Member : member@demo.com / member123

PROJECT STRUCTURE
-----------------
team-task-manager/
├── backend/
│   ├── server.js          Entry point
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js        JWT protection + admin guard
│   └── .env.example
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js          Routes
        ├── index.js
        ├── index.css       Global styles
        ├── context/
        │   └── AuthContext.js
        ├── utils/
        │   └── api.js      Axios instance with interceptors
        └── pages/
            ├── LoginPage.js
            ├── SignupPage.js
            ├── DashboardPage.js
            ├── ProjectsPage.js
            ├── ProjectDetailPage.js
            └── UsersPage.js

================================================================
Built by: [Your Name]
Contact : [Your Email]
================================================================
