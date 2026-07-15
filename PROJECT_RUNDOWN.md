# ☕ Virtual Coffee Machine - Architecture & Project Rundown

Welcome to the **Virtual Coffee Machine** project documentation. This document provides a complete technical overview and architectural rundown of the digital office coffee queue system.

---

## 🚀 1. Technology Stack

The application is built on a modern, decoupled Full-Stack architecture:

- **Frontend**: React (TypeScript), React Router, Material UI (MUI), Socket.io-client, Lucide Icons, SheetJS (`xlsx`) for reports.
- **Backend**: Node.js (Express), TypeScript, Mongoose, Socket.io, Swagger UI / OpenAPI 3.0.
- **Data & Queue**: MongoDB (database), Redis & BullMQ (priority queue system).
- **Environment**: Docker, Docker Compose, Nginx (routing proxy).

---

## 📂 2. Directory Structure

```text
/ (Project Root)
├── docker-compose.yml         # Defines DB, Redis, Backend, and Frontend containers
├── README.md                  # Project documentation (merged guide)
├── PROJECT_RUNDOWN.md         # Detailed system architecture rundown
├── AIPOLICY.txt               # AI use-case log and declaration
├── backend/                   # Node.js API server & Queue processor
│   ├── src/
│   │   ├── app.ts             # Server entry point & Swagger documentation setup
│   │   ├── config/            # DB, Redis, and Socket.io server configs
│   │   ├── controllers/       # HTTP controllers (Orders, Reports, Histogram)
│   │   ├── models/            # MongoDB Order schema
│   │   ├── services/          # Mongoose CRUD & Queue producers
│   │   ├── workers/           # BullMQ workers (5-second coffee simulation loop)
│   │   └── mock/              # In-memory database & worker fallbacks (USE_MOCK=true)
│   └── test/                  # 13 Integration and Unit tests
└── frontend/                  # React Single-Page Application (SPA)
    ├── nginx.conf             # Production container reverse proxy configuration
    ├── vite.config.ts         # Development proxy configurations (port 3000 -> 5000)
    └── src/
        ├── App.tsx            # Main layout, routing, and MUI Theme Provider
        ├── components/        # Cards, custom form controls, and progress bars
        ├── context/           # OrderContext.tsx (Socket connection & global state)
        └── pages/             # Dashboard, Order placement, Reports, Analytics
```

---

## ⚙️ 3. Core Architectural Modules

### A. Real-Time State Management & Decoupling
- **Global Context (`OrderProvider`)**: Declared in [OrderContext.tsx](file:///D:/קפה/frontend/src/context/OrderContext.tsx). It acts as the single source of truth for the entire application, caching the order queue and active brewing progress.
- **Custom React Hook (`useOrders`)**: Pages consume state and actions (like submitting an order) purely through `useOrders()`. All networking, error boundaries, and socket hooks are completely separated from the UI layout.

### B. Event-Driven WebSockets (Socket.io)
- Instead of HTTP polling, a persistent WebSocket connection is opened:
  - When the BullMQ worker starts brewing, the backend emits `order:updated`.
  - When the worker finishes preparation, it updates the status and emits `order:updated`.
  - The client catches the socket event, instantly updating the React state list.

### C. Desktop & In-App Alerts
- **In-App Toast Fallback**: An animated Material UI `Snackbar` and `Alert` slide in from the top-right the moment the user's specific coffee is ready.
- **HTML5 Web Notifications**: Triggers native desktop popups when the browser tab is minimized or unfocused, ensuring the user gets their pick-up alert.

### D. Priority & Delayed Queues
- **VIP Priority**: Submitting as a "Boss" with the correct password (`coffee_boss`) sets the queue job priority to `1`, putting it in front of normal employee orders (priority `2`).
- **Delayed Brewing**: Users can schedule coffee preparation. The backend queues the job with a specific millisecond delay, holding it until the scheduled time.

---

## 📈 4. REST API & Documentation

The backend exposes an interactive **Swagger API Console** at **[http://localhost:3000/api](http://localhost:3000/api)**. 

### Key Endpoints:
- `POST /api/orders` - Creates a new coffee request (validates user inputs, handles priority/delay).
- `GET /api/orders` - Fetches active queue and log history.
- `GET /api/reports` - Returns orders filtered by year and month.
- `GET /api/histogram` - Aggregates orders per user to draw analytics charts.
