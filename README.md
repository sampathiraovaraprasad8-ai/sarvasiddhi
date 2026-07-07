# Sarvasiddhi Pooja Samagri E-commerce Store

A fully functional, beautiful, and professional e-commerce platform built from scratch. It features a complete customer storefront and a robust administrative panel with live order notifications and catalog controls.

---

## 🌸 Visual Aesthetics & Theme
- **Theme**: Premium Traditional Spiritual Indian Aesthetic.
- **Palette**: Deep Maroon (`#5C0612`) and Saffron Gold (`#E2A82B`), set against a warm Ivory background.
- **Typography**: Editorial Serif (`Playfair Display`) and modern geometric Sans-serif (`Outfit`).
- **Styles**: Glassmorphism accents, gold thin borders, micro-animations, and responsive cards.

---

## 🛠 Tech Stack
- **Frontend**: React (Vite, custom CSS transitions, Router DOM, Lucide Icons).
- **Backend**: Node.js & Express (RESTful API endpoints, JWT token authentication).
- **Database**: Pure JavaScript, file-persisted JSON database driver (`db.js` saving to `db.json`) for zero compilation dependency issues.

---

## 📁 Repository Structure
```
sarvasiddhi/
├── package.json           # Monorepo scripts (Dev, Build, Start)
├── server.js              # Express API endpoints & React asset serving
├── db.js                  # Database connection, schemas, and seeding
├── db.json                # Persisted database (auto-generated)
└── frontend/              # Vite React app
    ├── src/
    │   ├── App.jsx        # Route controllers (Customer & Admin gates)
    │   ├── index.css      # Styling system and CSS variables
    │   ├── components/    # Reusable elements (Navbar, Footer, ProductCard)
    │   ├── context/       # AppContext (Auth state, Cart, Wishlist, Notifications)
    │   └── views/         # Core customer pages and Admin dashboard panels
```

---

## 🚀 How to Run Locally

### 1. Installation
In the root directory, run the command to install both backend and frontend dependencies:
```bash
npm run install-all
```

### 2. Run in Development Mode
To start both the Express backend and the Vite hot-reloading frontend concurrently:
```bash
npm run dev
```
- Frontend will open on `http://localhost:5173`.
- Backend server will run on `http://localhost:5000`.
- Requests to `/api` from the client are automatically proxied to port 5000.

### 3. Run in Production Mode (Simulate Cloud Deployment)
First, compile and bundle the React application:
```bash
npm run build
```
This builds static assets into `frontend/dist`. Next, start the server:
```bash
npm start
```
The entire application (APIs + Frontend) will run on `http://localhost:5000`.

---

## 🛡 Login Credentials

### Admin Dashboard Login:
- **Email**: `admin@sarvasiddhi.com`
- **Password**: `admin123`
*(Pre-seeded automatically during first launch!)*

---

## ☁ Deployment Guide

The project is structured as a **single monorepo service** where the backend Express server serves the frontend production build directly. This makes it highly compatible with free and premium hosting services:

### Option 1: Render.com (Recommended)
1. Push this folder to your GitHub repository.
2. Log in to [Render](https://render.com) and click **New > Web Service**.
3. Link your GitHub repository.
4. Set the following configurations:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Click **Deploy**. Render will host the entire site under a single URL!

### Option 2: Docker Containerization
A `Dockerfile` is provided in the root workspace directory. You can build and run it using:
```bash
docker build -t sarvasiddhi-store .
docker run -p 5000:5000 sarvasiddhi-store
```
This is suitable for deploying on AWS Elastic Beanstalk, Google Cloud Run, DigitalOcean, or private VPS systems.
