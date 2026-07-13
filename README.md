# Virtual Coffee Machine

A smart, responsive web application for simulating a digital office coffee machine queue. Supports priority queueing, delayed preparation, real-time status tracking, reporting exports, and user analytics.

---

## 🚀 Tech Stack

- **Frontend:** React (TypeScript), React Router, Lucide Icons, SheetJS (xlsx) for exports.
- **Backend:** Node.js (Express), TypeScript, Mongoose.
- **Queue/Broker:** Redis, BullMQ (Priority & Delayed queues).
- **Database:** MongoDB.
  * **Database Choice Rationale:** MongoDB was selected because coffee orders are document-oriented records. Storing them as JSON documents in a schema-flexible store allows adding custom order attributes (e.g. coffee type, milk, sugar level) in the future without database migrations. It integrates seamlessly with Node.js via Mongoose.
- **Infrastructure:** Docker, Docker Compose.

---

## 📂 Project Architecture

```text
/ (Project Root)
├── docker-compose.yml         # Container services orchestration
├── README.md                  # Project documentation
├── backend/
│   ├── Dockerfile
│   ├── tsconfig.json
│   ├── package.json
│   └── src/
│       ├── app.ts             # Express entry point & routing
│       ├── config/            # Mongoose and Redis initialization
│       ├── controllers/       # HTTP request handlers
│       ├── models/            # Mongoose Order schema
│       ├── services/          # Business logic & BullMQ producers
│       └── workers/           # BullMQ queue workers (coffee simulation)
└── frontend/
    ├── Dockerfile
    ├── tsconfig.json
    ├── package.json
    └── src/
        ├── App.tsx            # Main layout and routing setup
        └── pages/             # Dashboard, Order Form, Reports, Analytics
```

---

## 🛠️ Getting Started

### Prerequisites
Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running on your system.

### Running with Docker (Recommended)

1. Clone or navigate to the repository directory.
2. Spin up the containers using Docker Compose:
   ```bash
   docker-compose -p coffee up --build
   ```
3. Once running, access the services:
   - **Frontend App:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)
   - **MongoDB Database:** `mongodb://localhost:27017`
   - **Redis Instance:** `redis://localhost:6379`

### Running Locally (Mock Mode - No Docker Required)

If Docker is unavailable, the application can run in **Mock Mode** using in-memory arrays for database/queue storage:

1. Install dependencies in both folders:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. Start the backend dev server in mock mode:
   ```bash
   cd backend
   # Windows PowerShell
   $env:USE_MOCK="true"; npm run dev
   # Bash/macOS
   USE_MOCK=true npm run dev
   ```
3. Start the React frontend dev server:
   ```bash
   cd ../frontend
   npm run dev
   ```
4. Access the React client on [http://localhost:5173](http://localhost:5173).

---

## 📝 Configuration (`.env`)

- **Backend Configuration (`backend/.env`):**
  - `PORT`: Server port (default: `5000`).
  - `USE_MOCK`: Set to `true` to run mock mode locally.
  - `BOSS_PASSWORD`: Password required to prioritize VIP orders (default: `coffee_boss`).

To set a custom VIP password in Docker, add it under `environment` in [docker-compose.yml](file:///D:/קפה/docker-compose.yml):
```yaml
backend:
  environment:
    - BOSS_PASSWORD=my_custom_password
```

---

## ☕ Verification Guide

1. **Dashboard Monitoring:** Open the dashboard page to monitor active states. The brewing machine includes animated steam.
2. **Placing Normal Orders:** Submit an order under the "Employee" role. The dashboard will show status `In Queue` -> `Brewing` -> `Ready` (takes 5 seconds of mock preparation).
3. **Placing Priority Orders:** Submit an order as a "Boss" using the VIP password (`coffee_boss`). Boss requests will be pushed ahead of normal employee requests in the queue.
4. **Delayed Orders:** Submit a delayed request (e.g. 2 minutes). The worker will wait exactly 2 minutes before starting preparation.
5. **Analytics & Graphs:** View the SVG-based bar chart aggregation under the **Analytics** page. Click refresh to update.
6. **Exports:** Filter orders by year/month on the **Reports** page and click **Export to .xlsx** to download a spreadsheet.
