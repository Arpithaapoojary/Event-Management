# Parrophins Event Management Web Application

> **Technical Assessment Submission for Parrophins Private Limited**  
> A full-stack web application designed for institutions to organize, manage, and monitor events, while enabling students and attendees to browse available events and register seamlessly.

---

## 1. Project Overview and Purpose
The **Parrophins Event Management Web Application** is built to bridge the gap between event organizers and attendees. It provides:
1. **Public Student / Attendee Portal**: Allows users to explore upcoming campus workshops, hackathons, and conferences with real-time seat tracking and dynamic status badges (`UPCOMING`, `FULL`, `PAST`), followed by quick registration with instant digital ticket passes.
2. **Administrative Management Portal**: Offers institutional coordinators summary metrics, full event CRUD controls (with data-preserving soft deletion), and attendee roster tracking with real-time search.

---

## 2. Features Implemented

### **Module 1: Event Listing & Discovery**
- **Catalog Grid**: Responsive cards displaying banner images, event titles, descriptions, venues, dates, and dynamic status badges.
- **Dynamic Status & Real-Time Capacity**: Auto-calculates status based on datetime and registration count (`UPCOMING`, `FULL`, `PAST`).
- **Interactive Search & Status Filtering**: Real-time filtering across titles, venues, and descriptions with quick tabs (`All`, `Upcoming`, `Open Seats`, `Past`).
- **Event Detail Page**: Rich event hero banner, venue and schedule chips, live capacity progress bar, and description.

### **Module 2: Event Registration**
- **Registration Form Modal**: Clean modal with client-side validation for Full Name, Email, and Phone Number.
- **Duplicate Prevention**: Compound unique indexing (`event + email`) rejects duplicate registrations with friendly `409 Conflict` feedback.
- **Capacity & Date Guards**: Prevents registrations for past events or events that have reached maximum capacity.
- **Atomic Counter**: Atomically updates `registeredCount` and `seatsLeft` without requiring a full page refresh.
- **Digital Attendee Pass**: Displays confirmation details and unique Ticket Reference (`#REG-XXXXXX`).

### **Module 3: Admin Dashboard & Summary Metrics**
- **Key Metrics Overview**: Real-time dashboard cards tracking:
  - Total Events
  - Total Registrations
  - Upcoming Events Count
  - Full / At-Capacity Events
- **Access Protection**: Admin route guard and passcode verification (`admin2026`) preventing unauthorized operations.

### **Module 4: Event Management (Admin CRUD)**
- **Create Event**: Form with validation for Title, Description, Date & Time (future date validation), Venue, Capacity, and Banner URL.
- **Update Event**: Modify existing event details with validation ensuring capacity cannot be reduced below current registered attendees.
- **Soft Deletion with Confirmation**: Destructive operations require confirmation. Events are soft-deleted (`isDeleted: true`), preserving historical registrations for institutional compliance.

### **Module 5: Registration Management**
- **Attendee Roster Modal**: View attendee details per event directly from the events table.
- **Global Registrations Table**: Search registrations by attendee name, email, or contact number.
- **Event Dropdown Filtering**: Filter registrations across all events or isolate a specific event.

---

## 3. Technologies and Tools Used

- **Frontend**:
  - React 18 (Vite)
  - Tailwind CSS (Utility-first styling)
  - Lucide React (Icons)
  - React Router v6 (Client-side routing)
  - Axios (HTTP client with request interceptors)
- **Backend**:
  - Node.js & Express.js (REST API)
  - Mongoose ODM (Data modeling & schemas)
  - CORS, Dotenv
  - Nodemon (Development server)
- **Database**:
  - MongoDB Atlas (Cloud database with replica sets and indexing)
- **Version Control**:
  - Git & GitHub

---

## 4. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas** account (or local MongoDB v6.0+)
- Modern web browser (Chrome, Edge, Firefox, Safari)

---

## 5. Installation and Setup Instructions

### Clone the Repository
```bash
git clone https://github.com/Arpithaapoojary/Event-Management.git
cd Event-Management
```

### Install Backend Dependencies
```bash
cd server
npm install
```

### Install Frontend Dependencies
```bash
cd ../client
npm install
```

---

## 6. Environment Variables Configuration

Create a `.env` file in the `server/` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.lqymip6.mongodb.net/event_management?retryWrites=true&w=majority
JWT_SECRET=parrophins_event_secret_key_2026
ADMIN_KEY=admin2026
```

> **Note**: A reference template is provided at [`server/.env.example`](file:///c:/Event%20Management/server/.env.example).

---

## 7. Instructions for Running Locally

### Step 1: Start Backend Server
Open a terminal and run:
```bash
cd server
npm run dev
```
Backend will start on: **`http://localhost:5000`**

### Step 2: (Optional) Seed Sample Events
To populate initial sample events:
```bash
cd server
node utils/seed.js
```

### Step 3: Start Frontend Client
Open a second terminal and run:
```bash
cd client
npm run dev
```
Client will start on: **`http://localhost:5173`**

### Admin Credentials
- Navigate to **`http://localhost:5173/admin`**
- Passcode: **`admin2026`**

---

## 8. API Endpoint Documentation

### Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/events` | List all non-deleted events. Supports `?status=upcoming\|open\|past` and `?search=query` |
| `GET` | `/api/events/:id` | Fetch details of a single event |
| `POST` | `/api/events/:id/register` | Register attendee (`fullName`, `email`, `contactNumber`) with duplicate/capacity validation |

### Admin Endpoints (Requires `x-admin-key: admin2026` or `Authorization: Bearer admin2026`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Verify admin passcode and receive access token |
| `GET` | `/api/admin/stats` | Aggregated dashboard metrics (total events, registrations, upcoming, full) |
| `POST` | `/api/admin/events` | Create a new event with input validation |
| `PUT` | `/api/admin/events/:id` | Update an existing event |
| `DELETE` | `/api/admin/events/:id` | Soft-delete event (sets `isDeleted: true`, preserves registrations) |
| `GET` | `/api/admin/registrations` | View registrations across all events with search and event filter |
| `GET` | `/api/admin/events/:id/registrations`| View attendee list for a specific event |

---

## 9. Database Schema Overview

### 1. `Event` Model (`server/models/Event.js`)
| Field | Type | Attributes |
| :--- | :--- | :--- |
| `title` | String | Required, Trim, Min 3, Max 150 |
| `description` | String | Required, Trim, Max 3000 |
| `dateTime` | Date | Required |
| `venue` | String | Required, Trim |
| `capacity` | Number | Required, Min 1 |
| `registeredCount` | Number | Default: 0, Min 0 |
| `imageUrl` | String | Default Unsplash event banner |
| `isDeleted` | Boolean | Default: false, Indexed for soft-delete |
| *Virtual: `status`* | String | Computes `'UPCOMING'`, `'FULL'`, or `'PAST'` |
| *Virtual: `seatsLeft`*| Number | Computes `max(0, capacity - registeredCount)` |

### 2. `Registration` Model (`server/models/Registration.js`)
| Field | Type | Attributes |
| :--- | :--- | :--- |
| `event` | ObjectId | Ref: `'Event'`, Required, Index |
| `fullName` | String | Required, Trim, Min 2, Max 100 |
| `email` | String | Required, Trim, Lowercase, Regex validated |
| `contactNumber` | String | Required, Trim, Regex validated |
| `createdAt` | Date | Timestamp |
| **Index** | `{ event: 1, email: 1 }` | **Compound Unique Index** (Prevents duplicate registrations) |

#### Approach to Deleted Events & Data Consistency (Soft Delete Decision)
EventFlow strictly adheres to an **institutional soft-deletion strategy**:
- **Why Soft Delete?**: Hard-deleting events would sever foreign-key relationships, orphan student attendee tickets, destroy audit trails, and risk irreversible data loss if an event was deleted accidentally.
- **Implementation**: Deleting an event sets `isDeleted: true` and records a `deletedAt` timestamp (with virtual status `'CANCELLED'`).
- **Catalog & Stats Isolation**: Soft-deleted events are automatically excluded from the public student portal, from default admin event lists, and from active KPI metrics (`Total Events`, `Upcoming Events`, and active `Total Registrations`).
- **Archival Integrity**: Student registrations associated with soft-deleted events are safely preserved, marked with a clear `Event deleted` archive label, and locked into read-only mode for audit compliance.
- **Auditing & Restoration**: Institutional administrators can toggle `"Show Deleted"` in the Event Management table to audit deactivated events or restore an event with a single click via `POST /api/admin/events/:id/restore`.
- **Capacity Safety**: Updating an event never detaches registrations; capacity validation guarantees that capacity cannot be reduced below the current number of confirmed attendees.

---

## 10. Enterprise Architecture & Security Overview

### 1. Authentication and Access Control Approach
- **Server-Side Enforcement**: All administrative API endpoints (`/api/admin/*`) require server-side token verification via `adminAuth` middleware. Security is enforced on the backend, not solely by hiding UI buttons.
- **401 Unauthorized vs. 403 Forbidden**:
  - Missing token credentials immediately return `401 Unauthorized`, triggering automatic client-side session expiry redirection to `/admin/login?reason=expired`.
  - Present but invalid or unauthorized tokens return `403 Forbidden`, routing the user to a dedicated enterprise 403 page (`/admin/forbidden`).
- **User Session Menu**: Replaced consumer badges with an enterprise user menu displaying administrator avatar initials (`EC`), user role (`Coordinator / Administrator`), and a secure `Sign Out` action.

### 2. Validation Rules (Client and Server)
- **Field Whitelist & Whitespace**: Required fields (`title`, `description`, `dateTime`, `venue`, `capacity`) cannot be empty or whitespace-only.
- **String Length Limits**: Title is restricted to a maximum of 120 characters; Description is restricted to a maximum of 1,000 characters. Character counters provide instant visual feedback.
- **Date Guards**: Date and start time must be valid ISO dates. For newly created events, past dates are strictly rejected on both client and server.
- **Headcount & Capacity Validation**: Capacity must be a positive integer (`>= 1`). When updating existing events, capacity cannot be reduced below the count of existing confirmed attendees (`registeredCount`).
- **Accessible Inline Errors**: Form fields link error messages using `aria-describedby` and `role="alert"` in `text-red-600`. Submit buttons are disabled while form inputs are invalid or actively submitting.

---

## 11. Known Limitations & Future Enhancements
- **QR Code Check-In**: Generating scannable QR tickets for physical event check-in.
- **Automated Email Confirmation**: Integrating Nodemailer / SendGrid for email ticket confirmations.
- **Waitlist Support**: Adding automatic waitlists when an event reaches maximum capacity.

