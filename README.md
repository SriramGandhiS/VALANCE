# Valence Dashboard (Client Delivery)

Welcome to the Valence Dashboard SPA. This application has been custom-built to fully satisfy and exceed the project requirements.

## What You Asked For vs. What We Delivered

| Client Requirement | Our Delivery |
|--------------------|--------------|
| **Angular 12+ & Node.js/TypeScript** | Delivered a highly modular Angular SPA powered by a robust Express/TypeScript backend. |
| **Login Page with Roles** | Fully functional JWT authentication supporting "General User" and "Admin" roles, backed by an in-memory data store. |
| **Logged In Page with User Details** | A dedicated Profile Card displays user details on the dashboard, alongside a real-time table of records. |
| **Role-based Record Access** | Implemented secure role-filtering. Admins can see "Admin-Only" records; General Users only see public records. |
| **Admin User Management Mechanism** | Delivered a dedicated, protected Admin Module allowing full CRUD operations (Create, Edit, Delete, Deactivate) on users in the database. |
| **Async API Delay Mechanism** | Built an interactive "Async Delay" slider directly into the dashboard. You can manually adjust the API response time to observe our elegant, asynchronous skeleton loaders in action. |
| **Modular Code with Services** | Codebase strictly uses Lazy Loading for modules (Auth, Dashboard, Admin) and separates concerns into `AuthService`, `UserService`, and `RecordsService`. |

### Bonus: Premium Cinematic UI
Beyond the core requirements, we overhauled the user interface. We utilized a **Motion Sites-inspired Dark Glassmorphism** aesthetic. Instead of a generic white-box table, your dashboard features premium dark glass overlays, high-contrast typography, and a cinematic background video, giving it the feel of a top-tier SaaS product.

---

## How to Run the Application Locally

### Prerequisites
- Node.js (v16+)
- npm

### 1. Start the Backend API
Open a terminal and run:
```bash
cd backend
npm install
npm run dev
```
*(The backend runs on `http://localhost:3000`)*

### 2. Start the Frontend (Angular SPA)
Open a new, separate terminal and run:
```bash
cd frontend
npm install
npm start
```
*(The frontend runs on `http://localhost:4200`)*

### 3. Login Credentials
Once the app is running, navigate to `http://localhost:4200` and use the following dummy credentials:

- **Admin Access:**
  - **User ID:** `admin01`
  - **Password:** `admin123`
- **General User Access:**
  - **User ID:** `user01`
  - **Password:** `user123`
