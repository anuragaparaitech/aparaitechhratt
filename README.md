# Aparaitech HRMS | Enterprise Attendance Portal (MERN Stack)

A complete MERN (MongoDB, Express, React, Node.js) stack conversion of the Employee Attendance System. This project features a beautiful enterprise-grade dark UI, automated timing classifications, manual admin overrides, directory seeding, and spreadsheet exporting.

---

## 📁 Project Structure

```text
employee-attendance-system_APARAITECH-main/
│
├── backend/                   # Node.js + Express Backend (formerly server/)
│   ├── config/
│   │   └── db.js              # Mongoose MongoDB Connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   └── attendanceController.js
│   ├── models/
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   └── ActiveSession.js   # Stores active check-ins
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   └── attendanceRoutes.js
│   ├── utils/
│   │   └── helpers.js         # Working hours & classification helpers
│   ├── server.js              # Express entry listener
│   ├── package.json           # Backend dependency mappings
│   └── .env                   # Backend environment configs
│
├── frontend/                  # React.js Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── EmployeePanel.jsx
│   │   │   ├── AddEmployeeModal.jsx
│   │   │   ├── MarkAttendanceModal.jsx
│   │   │   └── ChangePwdModal.jsx
│   │   ├── services/
│   │   │   └── api.js         # Axios client-side configurations
│   │   ├── styles/
│   │   │   └── global.css     # Styling system & dark aesthetics
│   │   ├── App.jsx            # Global router and toast system
│   │   └── main.jsx           # DOM mounting entry point
│   ├── index.html             # Vite HTML entry point
│   ├── package.json           # Frontend dependency mappings
│   ├── vite.config.js         # Vite configuration options
│   └── .env                   # Frontend environment configs (API target)
│
├── legacy-backup/             # Original static HTML/CSS/JS files
└── README.md                  # Setup & execution guides
```

---

## 🚀 Setup & Installation Instructions

Ensure you have [Node.js (v18+)](https://nodejs.org/) installed on your machine.

### 1. Database Configuration
The backend is already configured with your MongoDB Atlas URI inside `backend/.env`.
The application automatically seeds the database with the **Administrator account** and all **37 predefined employee listings** on the first connection.

### 2. Install Dependencies

You need to install dependencies for both the frontend (`frontend` directory) and the backend (`backend` directory).

Open your terminal in the project root:

**Install Frontend Dependencies:**
```bash
cd frontend
npm install
cd ..
```

**Install Backend Dependencies:**
```bash
cd backend
npm install
cd ..
```

---

## 💻 Running the Application

To run the application, you need to start both the backend server and the frontend client.

1. **Start the Express Server (Backend):**
   Open a terminal, go to the `backend/` directory, and run:
   ```bash
   cd backend
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

2. **Start the Vite Dev Server (Frontend):**
   Open a second terminal, go to the `frontend/` directory, and run:
   ```bash
   cd frontend
   npm run dev
   ```
   *The frontend application will load at `http://localhost:3000`.*

---

## 🔑 Default Login Credentials

### 👑 Admin Credentials
- **Email:** `admin@aparaitech.com`
- **Password:** `admin123`

### 👨‍💻 Seeded Employee Credentials
- **Emails:** Any of the 37 raw emails (e.g., `pratikumeshpawar@gmail.com`, `akanshaatole0202@gmail.com`)
- **Default Password:** `Aparaitech123@`

---

## 📝 Attendance Classification Rules
- **Quarter Day:** Marked if Check-In is between **10:15 - 11:00 AM** OR Check-Out is between **5:00 - 7:00 PM**.
- **Half Day:** Marked if Check-In is between **11:00 AM - 4:30 PM** OR Check-Out is before **4:30 PM**.
- **Full Day:** Marked for standard working windows (**9:30 AM - 6:30 PM**).
