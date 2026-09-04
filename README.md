# 📚 Smart Library Management System with Book Recommendation and QR-Based Borrowing

A modern, enterprise-grade, human-centered **Smart Library Management System** built with **React 18 + Tailwind CSS + Node.js/Express + Recharts + QR Code Engine**.

---

## 🌟 Key Smart Features

### 🎓 1. Student Portal Experience
- **Personalized AI Book Recommendations**: Content-based recommendation algorithm (*"Because you read..."*) scoring books based on borrowed subjects, authors, and department curriculum.
- **Smart Multi-Field Search & Live Filters**: Real-time search across Title, Author, ISBN, Subject, Department, and Keywords with instant availability status.
- **Digital Library QR Pass**: Instant personal QR badge for rapid 1-second checkouts and check-ins at the front desk.
- **Borrowing Timeline & Due Date Countdowns**: Visual countdown badges, overdue penalty tracker (₹10/day rule), and 1-click renewal requests.
- **Book Reservation & Waitlist**: Automated queue system with instant notifications when a reserved book is checked back in.
- **In-App Notification Center**: Real-time alerts for approaching due dates, overdue warnings, and reservation pickups.

### 🛡️ 2. Librarian & Admin Command Center
- **Live Circulation Desk with QR Scanner**: Camera webcam scanning + 1-click simulator to instantly scan student ID passes and book barcodes.
- **Interactive Analytics & Trends (Recharts)**: Monthly circulation velocity charts, subject genre distribution, peak weekday traffic patterns, and student scholar leaderboard.
- **Predictive Turnover & Demand Analytics**: Machine-learning velocity calculations `(borrows / total copies)` with proactive replenishment and restock advice.
- **Inventory Management**: Complete catalog CRUD with shelf rack locations, total physical copies tracking, and printable QR barcode labels.
- **Student Scholar Registry**: Comprehensive member directory with contact info and active loan counts.
- **Automated Fine Settlement**: Overdue tracking with one-click payment settlement.

---

## 🔑 Demo Login Credentials

For quick testing and evaluation, 1-click login buttons are embedded in the login page and top navbar:

| Role | Name | Email | Password | Features |
| :--- | :--- | :--- | :--- | :--- |
| **👑 Chief Librarian** | Dr. Albus Vance | `admin@smartlib.edu` | `admin123` | Full admin analytics, circulation desk, QR scanner, book CRUD |
| **🎓 Student (Senior)** | Aarav Sharma | `aarav@student.edu` | `student123` | Recommendations, active loans, overdue fines, digital QR pass |
| **🎓 Student (Junior)** | Priya Patel | `priya@student.edu` | `student123` | Clean loan history, AI discovery, book reservations |

---

## 🛠️ Project Structure

```
library/
├── package.json               # Root scripts for running server & client concurrently
├── server/                    # Node.js + Express Backend API
│   ├── data/
│   │   └── store.js           # Persistent zero-config data engine & state store
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── circulationController.js
│   │   ├── recommendationController.js
│   │   ├── analyticsController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification & role authorization
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── circulationRoutes.js
│   │   ├── recommendationRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── notificationRoutes.js
│   ├── utils/
│   │   ├── recommender.js     # AI content-based similarity recommender
│   │   ├── predictor.js       # Availability and demand forecasting
│   │   └── seedData.js        # Realistic university catalog seed data
│   ├── package.json
│   └── server.js
├── client/                    # React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Navbar, Sidebar, Modal, QRViewerModal, QRScannerModal, StatCard
│   │   │   └── layout/        # DashboardLayout, ProtectedRoute
│   │   ├── context/           # AuthContext (JWT & Demo Switcher), ThemeContext (Dark/Light)
│   │   ├── pages/             # Landing, Login, Register, Student & Admin Dashboards
│   │   ├── services/          # api.js client service
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 📥 Installation

```bash
# Clone the repository (or extract repository zip with .git folder)
cd library

# Install root, backend, and frontend dependencies
npm run install-all
```

---

## 🏗️ Build

To compile and build the production assets for the client and server:

```bash
# Build the production bundle
npm run build
```

---

## 🧪 Testing

To run the automated unit tests, integration tests, and coverage reports:

```bash
# Run unit tests across modules
npm test

# Run tests with coverage
npm run test:coverage
```

---

## 🚀 How to Run the Application

### Option 1: Quick Start (Full-Stack Dev Server)

1. Open your terminal in this `library` directory.
2. Start both server and client concurrently:
   ```bash
   npm run dev
   ```
3. Open your browser:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
   - **Direct Standalone Web App**: Open `app.html` or `index.html` in any browser!

---

### Option 2: Running Server and Client in Separate Terminals

#### Terminal 1 (Backend Server):
```bash
cd server
npm install
npm start
```
*Server will launch at `http://localhost:5000`*

#### Terminal 2 (React Client):
```bash
cd client
npm install
npm run dev
```
*Client will launch at `http://localhost:3000`*

---

## 🤖 Smart Algorithms Under the Hood

### 1. Multi-Vector Recommendation Engine (`recommender.js`)
Calculates multidimensional relevance between a student's reading history vectors (categories, authors, subject keywords, tags) and unread catalog items:
$$\text{Score} = w_{\text{category}} \cdot \text{Freq}_{\text{cat}} + w_{\text{subject}} \cdot \text{Freq}_{\text{sub}} + w_{\text{author}} \cdot \text{Freq}_{\text{auth}} + w_{\text{tag}} \cdot \text{Match}_{\text{tag}} + \text{Rating Bonus}$$

### 2. Availability & Demand Predictor (`predictor.js`)
Calculates turnover ratio $\text{Turnover} = \frac{\text{Total Borrows}}{\text{Total Copies}}$ and automatically estimates return dates for out-of-stock items, giving librarians actionable procurement advice.

### 3. QR Code Pass & Barcode Engine
Standardized JSON payload encoding enables any webcam or USB scanner hardware to process 1-second checkouts and check-ins.
