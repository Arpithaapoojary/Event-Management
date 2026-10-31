# EventFlow — Campus Event Management Platform

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**EventFlow** is an enterprise-grade campus event operations and student pass management platform. It streamlines event publishing, real-time seat availability tracking, student registrations, digital pass issuing, and administrative roster analytics across collegiate departments.

---

## Architecture & System Overview

EventFlow is architected as a high-performance decoupled full-stack application:

```
Event-Management/
├── client/                     # Frontend Single Page Application (SPA)
│   ├── src/
│   │   ├── api/                # Axios instance with auth interceptors & session guards
│   │   ├── components/
│   │   │   ├── admin/          # Coordinator console (CRUD modals, roster drawers, tables)
│   │   │   ├── common/         # App shell, Navbar, simplified Footer
│   │   │   ├── events/         # Event cards, ticket passes, registration modals
│   │   │   └── home/           # Hero section, category showcase, stats
│   │   ├── pages/              # Routing views (HomePage, EventDetailPage, AdminPortal)
│   │   └── utils/              # Universal image URL resolution & canvas compression
│   ├── public/                 # Static public assets
│   └── vite.config.js          # Vite config with dev proxy configuration
│
└── server/                     # Backend REST API Service
    ├── config/                 # MongoDB Atlas connection configuration
    ├── controllers/            # Business logic (eventController, adminController)
    ├── middleware/             # adminAuth, multipart upload, centralized error handling
    ├── models/                 # Mongoose schemas (Event, Registration)
    ├── routes/                 # Express API routes (/api/events, /api/admin)
    └── utils/                  # Automated seeding scripts (seedRealData.js)
```

---

## Core Capabilities

### 1. Attendee & Student Experience
- **Interactive Event Discovery**: Categorized lineups spanning **Cultural**, **Technical**, and **Sports** events with real-time capacity meters and live countdowns.
- **Dynamic Capacity Badging**: Intelligent status computation (`UPCOMING`, `OPEN TO ALL`, `X SEATS LEFT`, `REGISTRATION FULL`, `CONCLUDED`).
- **One-Click Event Registration**: Streamlined signup modal with client-side regex phone and email validation, preventing duplicate applications per attendee.
- **Digital Attendee Pass**: Real-time generation of digital admission passes with verification barcodes and unique registration reference codes (`#REG-XXXXXX`).

### 2. Coordinator & Operations Dashboard
- **Executive Overview Console**: High-density metrics tracking total active events, total confirmed attendees, upcoming schedule lineups, and full-capacity events.
- **Schedule Management**: Full CRUD operations with future-date constraints, capacity protection guards, and multi-tier category tagging.
- **Visual Banner Engine**: In-browser automatic canvas image compression (1200px max, ~150KB), live instant photo preview, preset campus themes, and CDN URL support.
- **Attendee Roster Management**: Real-time roster search across attendees, event-specific filtering, and one-click verified CSV export for campus security checkpoints.
- **Audit-Safe Soft Deletion**: Deleting events safely archives records (`isDeleted: true`), preserving historical registration rosters for institutional audit compliance while isolating them from the public lineup.

### 3. Security & Data Integrity
- **Role-Based Access Control**: Administrative routes protected by token verification (`x-admin-key`).
- **Session Auto-Termination**: Automatic credential cleanup on administrative exit to prevent shared workstation unauthorized access.
- **Race Condition Prevention**: Atomic increment operations (`$inc: { registeredCount: 1 }`) ensuring zero overbooking at peak registration rushes.
- **Compound Unique Constraints**: Database-level compound indexes (`{ event: 1, email: 1 }`) rejecting duplicate submissions.

---

## Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 & Vite | Fast SPA bundling, hot module replacement, and client-side routing |
| **Styling** | Tailwind CSS & PostCSS | Responsive design system with custom design tokens |
| **Typography** | Inter & Outfit Display | Modern executive typography and balanced readability |
| **Icons** | Lucide React | Clean, monoline iconography |
| **HTTP Client** | Axios | Configured with request/response interceptors and error normalization |
| **Backend Framework** | Node.js & Express.js | Modular RESTful API architecture |
| **Database & ODM** | MongoDB Atlas & Mongoose | Cloud document database with replica sets, schemas, and compound indexes |
| **File Handling** | Multer & HTML5 Canvas | Client-side optimization and server-side multipart storage |
| **Deployment** | Vercel & Render | Cloud hosting with automated continuous deployment |

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB Atlas** cluster or local MongoDB instance

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Arpithaapoojary/Event-Management.git
   cd Event-Management
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

---

### Environment Configuration

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.lqymip6.mongodb.net/event_management?retryWrites=true&w=majority
JWT_SECRET=eventflow_secret_key_2026
ADMIN_KEY=admin2026
```

> **Note**: A reference template is available at [`server/.env.example`](server/.env.example).

---

### Running the Application Locally

#### 1. Start the Backend API Service
```bash
cd server
npm run dev
```
*API will run on **`http://localhost:5000`***

#### 2. Seed Realistic Event & Registration Data (Optional)
To initialize the database with 9 balanced events and real student registrations:
```bash
cd server
node utils/seedRealData.js
```

#### 3. Start the Frontend Client
```bash
cd client
npm run dev
```
*Application will open at **`http://localhost:5173`***

---

## API Reference

### Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check and uptime status |
| `GET` | `/api/events` | Retrieve active events with optional `category` and `search` filters |
| `GET` | `/api/events/:id` | Retrieve comprehensive event details |
| `POST` | `/api/events/:id/register` | Register an attendee with duplicate and capacity validation |

### Coordinator Endpoints (Protected by `x-admin-key`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Verify passcode and issue coordinator session token |
| `GET` | `/api/admin/stats` | Retrieve aggregated dashboard KPI metrics |
| `GET` | `/api/admin/events` | List all events (including soft-deleted archives) |
| `POST` | `/api/admin/events` | Publish a new event with input validation |
| `PUT` | `/api/admin/events/:id` | Update existing event details and seating limits |
| `DELETE` | `/api/admin/events/:id` | Soft-delete an event while preserving registration history |
| `POST` | `/api/admin/events/:id/restore` | Restore an archived event back to active schedule |
| `POST` | `/api/admin/upload` | Upload event banner image asset |
| `GET` | `/api/admin/registrations` | Fetch attendee rosters across all events with search and filters |
| `GET` | `/api/admin/events/:id/registrations` | Fetch attendee list for a specific event |

---

## Data Models

### `Event` Schema
```javascript
{
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  dateTime: { type: Date, required: true },
  venue: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true, min: 1 },
  registeredCount: { type: Number, default: 0, min: 0 },
  imageUrl: { type: String, default: '...' },
  category: { type: String, enum: ['Cultural', 'Technical', 'Sports', 'Other'], default: 'Cultural' },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null }
}
```

### `Registration` Schema
```javascript
{
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true },
  contactNumber: { type: String, required: true, trim: true }
}
// Compound unique index: { event: 1, email: 1 }
```

---

## Production Deployment

### Frontend (Vercel)
1. Import repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://<your-backend-domain>.onrender.com/api`
5. Click **Deploy**.

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Set **Root Directory** to `server`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<your-production-mongodb-connection-string>`
   - `JWT_SECRET`: `<secure-random-secret>`
   - `ADMIN_KEY`: `<admin-passcode>`
7. Click **Deploy Web Service**.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
