# DevEvents - API Documentation & Architecture Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & System Design](#architecture--system-design)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Core Components](#core-components)
6. [Utilities & Libraries](#utilities--libraries)
7. [Environment Configuration](#environment-configuration)
8. [Development Guide](#development-guide)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

---

## 🎯 Project Overview

**DevEvents** is a modern event discovery and booking platform built with Next.js, TypeScript, and MongoDB. It enables users to explore tech events (conferences, meetups, hackathons) and book their spots seamlessly.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Next.js 16 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + Custom CSS |
| **Database** | MongoDB + Mongoose 9 |
| **File Upload** | Cloudinary |
| **Icons & UI** | Lucide React |
| **Animation** | OGL (WebGL) |

### Key Features

- 🎪 Discover tech events
- 📅 Event filtering by date and location
- 🎟️ Book event spots
- 🔍 Smart event recommendations based on tags
- 📱 Responsive design with animations

---

## 🏗️ Architecture & System Design

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser / Client                            │
│                    (React 19 + Next.js 16)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌───────────────┐  ┌──────────────┐  ┌──────────────┐
    │   Page.tsx    │  │ Components   │  │   Actions    │
    │  (Server)     │  │  (.tsx)      │  │  ('use srv') │
    └───────┬───────┘  └──────────────┘  └──────┬───────┘
            │                                    │
            └────────────────┬───────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐
    │  GET Events │  │ GET Event    │  │ POST Create      │
    │  [Route]    │  │ [slug]       │  │ Event (FormData) │
    │             │  │ [Route]      │  │ with Image       │
    └─────────────┘  └──────────────┘  └──────────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   MongoDB       │
                    │  + Mongoose     │
                    │  Models & Ops   │
                    └─────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ Event Model  │  │ Booking      │  │ Cloudinary   │
   │ Collection   │  │ Model        │  │ (File CDN)   │
   │              │  │ Collection   │  │              │
   └──────────────┘  └──────────────┘  └──────────────┘
```

### Request Flow - Event Discovery

```
User Visits Home Page
         │
         ▼
GET /api/events (Fetch All Events)
         │
         ▼
    Query MongoDB: Event.find()
         │
         ▼
    Return Events Array with Latest First (sorted by createdAt)
         │
         ▼
    Display as EventCards Component
```

### Request Flow - Event Details & Booking

```
User Clicks Event Card
         │
         ▼
Navigate to /events/[slug]
         │
         ▼
┌─────────────────────────────────────┐
│ GET /api/events/[slug]              │
│ 1. Validate slug format             │
│ 2. Query Event by slug              │
│ 3. Return event details             │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Server Action: getSimilarEvents()   │
│ 1. Find current event by slug       │
│ 2. Find events with matching tags   │
│ 3. Exclude current event            │
│ 4. Return similar events            │
└─────────────────────────────────────┘
         │
         ▼
Render Event Details Page with:
  - Event Description & Overview
  - Event Details (Date, Time, Location, Mode, Audience)
  - Agenda Items
  - Organizer Info
  - Tags
  - Booking Form
  - Similar Events Recommendations
```

---

## 🗄️ Database Schema

### Event Model (`database/event.model.ts`)

Stores comprehensive event information with automatic slug generation and date/time validation.

#### Collection: `events`

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `title` | String | Required, Min 3 chars | Event name |
| `slug` | String | Unique, Sparse, Lowercase | URL-friendly identifier (auto-generated) |
| `description` | String | Required, Min 10 chars | Short event description |
| `overview` | String | Required, Min 10 chars | Detailed event overview |
| `image` | String | Required | Event poster URL (from Cloudinary) |
| `venue` | String | Required | Event venue name |
| `location` | String | Required | Geographic location |
| `date` | String | Required, ISO Format | Event date (YYYY-MM-DD) |
| `time` | String | Required, HH:mm Format | Event time in 24-hour format |
| `mode` | String | Enum: online\|offline\|hybrid | Event delivery mode |
| `audience` | String | Required | Target audience description |
| `agenda` | Array[String] | Required, Min 1 item | Session/agenda items |
| `organizer` | String | Required | Organizer name/company |
| `tags` | Array[String] | Required, Min 1 item | Event categories (used for recommendations) |
| `createdAt` | Date | Auto | Document creation timestamp |
| `updatedAt` | Date | Auto | Document update timestamp |

#### Schema Hooks

**Pre-save Hook:**
- Generates `slug` from `title` if title is new/modified (converts to lowercase, replaces spaces with hyphens, removes special chars)
- Validates and normalizes `date` to ISO format (YYYY-MM-DD)
- Validates `time` format (HH:mm in 24-hour)

#### Example Document

```json
{
  "_id": "ObjectId('...')",
  "title": "React Summit 2026",
  "slug": "react-summit-2026",
  "description": "Join developers worldwide to explore React innovations",
  "overview": "A comprehensive conference covering React best practices...",
  "image": "https://res.cloudinary.com/...",
  "venue": "Amsterdam Convention Center",
  "location": "Amsterdam, Netherlands",
  "date": "2026-06-02",
  "time": "09:00",
  "mode": "offline",
  "audience": "Frontend Developers, Full Stack Engineers",
  "agenda": [
    "Opening Keynote: Future of React",
    "Workshop: Performance Optimization",
    "Panel Discussion: React Ecosystem"
  ],
  "organizer": "React Community Foundation",
  "tags": ["react", "javascript", "frontend", "conference"],
  "createdAt": "2025-01-16T10:00:00Z",
  "updatedAt": "2025-01-16T10:00:00Z"
}
```

---

### Booking Model (`database/booking.model.ts`)

Tracks event bookings with email validation and event reference integrity.

#### Collection: `bookings`

| Field | Type | Constraints | Description |
|-------|------|-----------|-------------|
| `eventId` | ObjectId | Required, Ref to Event | References the booked event |
| `email` | String | Required, Valid email format | Attendee email address |
| `createdAt` | Date | Auto | Booking creation timestamp |
| `updatedAt` | Date | Auto | Booking update timestamp |

#### Schema Hooks & Indexes

**Pre-save Hook:**
- Validates referenced event exists in database
- Validates email format (additional validation layer)

**Indexes:**
- `eventId` (ascending) - Optimizes queries finding bookings for a specific event

#### Example Document

```json
{
  "_id": "ObjectId('...')",
  "eventId": "ObjectId('...')",
  "email": "developer@example.com",
  "createdAt": "2025-01-16T11:30:00Z",
  "updatedAt": "2025-01-16T11:30:00Z"
}
```

---

## 🔌 API Endpoints

### Base URL

```
http://localhost:3000/api
```

or

```
{NEXT_PUBLIC_BASE_URL}/api
```

---

### 1. Get All Events

**Endpoint:** `GET /events`

**Purpose:** Fetch all events for the homepage/events listing page

**Request:**
```http
GET /api/events HTTP/1.1
Host: localhost:3000
```

**Response:** `200 OK`
```json
{
  "message": "Events fetched successfully!",
  "events": [
    {
      "_id": "ObjectId('...')",
      "title": "React Summit 2026",
      "slug": "react-summit-2026",
      "description": "Join developers worldwide...",
      "overview": "A comprehensive conference...",
      "image": "https://res.cloudinary.com/...",
      "venue": "Amsterdam Convention Center",
      "location": "Amsterdam, Netherlands",
      "date": "2026-06-02",
      "time": "09:00",
      "mode": "offline",
      "audience": "Frontend Developers",
      "agenda": ["Opening Keynote", "Workshop"],
      "organizer": "React Community Foundation",
      "tags": ["react", "javascript", "frontend"],
      "createdAt": "2025-01-16T10:00:00Z",
      "updatedAt": "2025-01-16T10:00:00Z"
    },
    {
      // ... more events
    }
  ]
}
```

**Error Response:** `500 Internal Server Error`
```json
{
  "message": "Fetching events failed!",
  "error": "Database connection timeout"
}
```

**Notes:**
- Returns all events sorted by `createdAt` in descending order (newest first)
- Used on homepage to display featured events
- No pagination currently implemented (suitable for small datasets)

**Implementation Location:** [app/api/events/route.ts](app/api/events/route.ts#L52-L69)

---

### 2. Get Single Event by Slug

**Endpoint:** `GET /events/[slug]`

**Purpose:** Fetch detailed information for a specific event

**URL Parameters:**
| Parameter | Type | Required | Format |
|-----------|------|----------|--------|
| `slug` | String | Yes | Alphanumeric + hyphens (e.g., `react-summit-2026`) |

**Request:**
```http
GET /api/events/react-summit-2026 HTTP/1.1
Host: localhost:3000
```

**Response:** `200 OK`
```json
{
  "message": "Event fetched successfully!",
  "event": {
    "_id": "ObjectId('...')",
    "title": "React Summit 2026",
    "slug": "react-summit-2026",
    "description": "Join developers worldwide to explore React innovations",
    "overview": "A comprehensive conference covering React best practices, new features, and real-world applications.",
    "image": "https://res.cloudinary.com/...",
    "venue": "Amsterdam Convention Center",
    "location": "Amsterdam, Netherlands",
    "date": "2026-06-02",
    "time": "09:00",
    "mode": "offline",
    "audience": "Frontend Developers, Full Stack Engineers",
    "agenda": [
      "Opening Keynote: Future of React",
      "Workshop: Performance Optimization",
      "Panel Discussion: React Ecosystem"
    ],
    "organizer": "React Community Foundation",
    "tags": ["react", "javascript", "frontend", "conference"],
    "createdAt": "2025-01-16T10:00:00Z",
    "updatedAt": "2025-01-16T10:00:00Z"
  }
}
```

**Error Responses:**

1. **400 Bad Request** - Invalid slug
```json
{
  "message": "Invalid slug parameter"
}
```

2. **400 Bad Request** - Invalid characters in slug
```json
{
  "message": "Slug contains invalid characters"
}
```

3. **404 Not Found** - Event doesn't exist
```json
{
  "message": "Event not found"
}
```

4. **500 Internal Server Error** - Server error
```json
{
  "message": "Failed to fetch event",
  "error": "Database connection failed"
}
```

**Validation Logic:**
- Slug must be a non-empty string
- Slug is trimmed and converted to lowercase
- Slug must match pattern: `^[a-z0-9-]+$` (only lowercase letters, numbers, hyphens)

**Implementation Location:** [app/api/events/[slug]/route.ts](app/api/events/[slug]/route.ts)

**Used By:** [app/events/[slug]/page.tsx](app/events/[slug]/page.tsx) - Event details page

---

### 3. Create New Event

**Endpoint:** `POST /events`

**Purpose:** Create a new event (used by admin/organizers)

**Request Body:** `multipart/form-data`

| Field | Type | Required | Validation | Description |
|-------|------|----------|-----------|-------------|
| `title` | String | Yes | Min 3 chars | Event name |
| `description` | String | Yes | Min 10 chars | Short description |
| `overview` | String | Yes | Min 10 chars | Detailed overview |
| `image` | File | Yes | Image file | Event poster (uploaded to Cloudinary) |
| `venue` | String | Yes | - | Event venue |
| `location` | String | Yes | - | Geographic location |
| `date` | String | Yes | Valid date | ISO date format (YYYY-MM-DD) |
| `time` | String | Yes | HH:mm format | 24-hour time format |
| `mode` | String | Yes | online\|offline\|hybrid | Event mode |
| `audience` | String | Yes | - | Target audience |
| `agenda` | JSON Array | Yes | Min 1 item | JSON stringified array of strings |
| `organizer` | String | Yes | - | Organizer name |
| `tags` | JSON Array | Yes | Min 1 item | JSON stringified array of tags |

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/events \
  -F "title=React Summit 2026" \
  -F "description=Join developers worldwide..." \
  -F "overview=A comprehensive conference..." \
  -F "image=@event-poster.jpg" \
  -F "venue=Amsterdam Convention Center" \
  -F "location=Amsterdam, Netherlands" \
  -F "date=2026-06-02" \
  -F "time=09:00" \
  -F "mode=offline" \
  -F "audience=Frontend Developers" \
  -F "agenda=[\"Opening Keynote\", \"Workshop\"]" \
  -F "organizer=React Community Foundation" \
  -F "tags=[\"react\", \"javascript\", \"frontend\"]"
```

**Response:** `201 Created`
```json
{
  "message": "User Created successfully",
  "user": {
    "_id": "ObjectId('...')",
    "title": "React Summit 2026",
    "slug": "react-summit-2026",
    "description": "Join developers worldwide...",
    "overview": "A comprehensive conference...",
    "image": "https://res.cloudinary.com/your-account/image/upload/v1234567890/DevEvent/abcd1234.jpg",
    "venue": "Amsterdam Convention Center",
    "location": "Amsterdam, Netherlands",
    "date": "2026-06-02",
    "time": "09:00",
    "mode": "offline",
    "audience": "Frontend Developers",
    "agenda": ["Opening Keynote", "Workshop"],
    "organizer": "React Community Foundation",
    "tags": ["react", "javascript", "frontend"],
    "createdAt": "2025-01-16T12:00:00Z",
    "updatedAt": "2025-01-16T12:00:00Z"
  }
}
```

**Error Responses:**

1. **400 Bad Request** - Invalid form data
```json
{
  "message": "Invalid JSON data"
}
```

2. **400 Bad Request** - Missing image
```json
{
  "message": "Image is required!"
}
```

3. **500 Internal Server Error** - Creation failure
```json
{
  "message": "Currently unable to create new user!",
  "error": "Validation failed: tags must contain at least one item"
}
```

**Processing Steps:**
1. Extract form data entries
2. Validate image file exists
3. Convert image to buffer
4. Upload to Cloudinary (folder: `DevEvent`)
5. Replace image field with Cloudinary URL
6. Parse `agenda` and `tags` from JSON strings
7. Create event in MongoDB
8. Return created event or error

**Implementation Location:** [app/api/events/route.ts](app/api/events/route.ts#L7-L49)

**Note:** Currently shows "User Created successfully" message (should be "Event Created successfully" - minor copy issue)

---

## 🧩 Core Components

### 1. Navbar (`components/Navbar.tsx`)

**Purpose:** Site navigation and branding

**Features:**
- Logo/branding display
- Navigation links
- Responsive design

---

### 2. EventCards (`components/EventCards.tsx`)

**Purpose:** Display event summary in card format

**Props:** `IEvent` interface
- `title`, `image`, `location`, `date`, `time`, `slug`

**Features:**
- Responsive card layout
- Image display (from Cloudinary)
- Event metadata preview
- Link to event details page

**Used By:**
- Homepage (featured events list)
- Event details page (similar events section)

---

### 3. BookEvent (`components/BookEvent.tsx`)

**Purpose:** Email subscription form for event booking

**State:**
- `event`: Stores email input
- `submitted`: Tracks form submission status

**Features:**
- Email input validation
- Submit button
- Success message on submission
- Client-side component (uses `'use client'`)

**Used By:** Event details page booking sidebar

**Note:** Currently stores email locally - no API integration for saving bookings

---

### 4. ExploreBtn (`components/ExploreBtn.tsx`)

**Purpose:** Call-to-action button for event discovery

**Features:**
- Styled button with hover effects
- Links to events exploration section

---

### 5. LightRays (`components/LightRays.tsx`)

**Purpose:** Animated WebGL background effect

**Features:**
- OGL-based ray animation
- Interactive mouse tracking
- Configurable colors and speed
- Visual enhancement for brand

**Used By:** Root layout background

---

## 🛠️ Utilities & Libraries

### MongoDB Connection (`lib/mongodb.ts`)

**Purpose:** Centralized MongoDB connection management with caching

**Functions:**

#### `connectToDatabase(): Promise<Mongoose>`
- Establishes connection to MongoDB via Mongoose
- Implements connection caching to prevent multiple connections
- Handles both development (hot reloads) and production scenarios
- Pool configuration: Min 5, Max 10 connections
- Socket timeout: 45 seconds

**Usage:**
```typescript
import connectToDatabase from "@/lib/mongodb";

await connectToDatabase();
// Database ready for queries
```

#### `disconnectFromDatabase(): Promise<void>`
- Cleanly disconnects from MongoDB
- Clears connection cache
- Used for testing or graceful shutdown

**Implementation:** [lib/mongodb.ts](lib/mongodb.ts)

---

### Utilities (`lib/utils.ts`)

**Purpose:** Common utility functions

#### `cn(...inputs: ClassValue[]): string`
- Merges Tailwind CSS classes with proper precedence
- Uses `clsx` for conditional classes
- Uses `tailwind-merge` to resolve conflicts
- Prevents duplicate/conflicting Tailwind classes

**Usage:**
```typescript
import { cn } from "@/lib/utils";

const buttonClass = cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500",
  isDisabled && "opacity-50"
);
```

---

### Constants (`lib/constants.ts`)

**Purpose:** Application-wide constants and mock data

**Exports:**
- `Event` interface - Type definition for event display
- `events` array - Mock events data for testing/fallback

**Note:** Mock data includes pre-configured event objects with slugs

---

## 🔄 Server Actions

### getSimilarEvents (`actions/events/getSimilarEvent.ts`)

**Purpose:** Find events similar to current event based on tags

**Function Signature:**
```typescript
export const getSimilarEvents = async(slug: string): Promise<IEvent[]>
```

**Parameters:**
- `slug`: String - Slug of current event

**Returns:**
- Array of similar events (empty array on error)

**Logic:**
1. Fetch event by slug
2. If event not found, return empty array
3. Query database for events:
   - Different ID than current event (`_id: { $ne: currentEventId }`)
   - With at least one matching tag (`tags: { $in: currentEventTags }`)
4. Return results as lean documents (read-only, faster)
5. Catch errors silently, return empty array

**Usage:**
```typescript
const similarEvents = await getSimilarEvents("react-summit-2026");
```

**Used By:** Event details page to show recommendations

**Implementation Location:** [actions/events/getSimilarEvent.ts](actions/events/getSimilarEvent.ts)

---

## 🎨 Pages

### Home Page (`app/page.tsx`)

**Route:** `/`

**Purpose:** Landing page with featured events

**Data Fetching:**
- Server component
- Fetches events from `GET /api/events`
- Sorts by newest first

**Sections:**
- Hero section with tagline
- Featured events list
- Call-to-action buttons

---

### Event Details Page (`app/events/[slug]/page.tsx`)

**Route:** `/events/[slug]`

**Purpose:** Display comprehensive event information

**Data Fetching:**
- Server component
- Fetches event details via `GET /api/events/[slug]`
- Fetches similar events via `getSimilarEvents()` action

**Sections:**
1. **Header** - Event title and description
2. **Details** - Image, overview, metadata, agenda
3. **Booking Sidebar** - Email signup form with attendee count
4. **Similar Events** - Related events based on tags

**Error Handling:**
- Shows 404 page if event not found or missing description

---

## ⚙️ Environment Configuration

### Required Environment Variables

**`.env.local`**

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/devevents?retryWrites=true&w=majority

# Cloudinary Image Upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Configuration Sources

- **MongoDB:** Connection string from MongoDB Atlas
- **Cloudinary:** API credentials from Cloudinary dashboard
- **Base URL:** Frontend URL for API calls

---

## 🚀 Development Guide

### Installation & Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd devevents

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Start development server
npm run dev

# 5. Visit application
# Open http://localhost:3000 in browser
```

### Available Scripts

```bash
npm run dev      # Start development server (hot reload)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint checks
```

### Project Structure Best Practices

```
devevents/
├── app/                  # Next.js app router
│   ├── api/              # API routes
│   │   └── events/       # Event endpoints
│   ├── events/           # Event pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── EventCards.tsx    # Event display card
│   ├── BookEvent.tsx     # Booking form
│   └── ...
├── database/             # Mongoose models
│   ├── event.model.ts    # Event schema
│   ├── booking.model.ts  # Booking schema
│   └── index.ts          # Model exports
├── lib/                  # Utilities
│   ├── mongodb.ts        # DB connection
│   ├── utils.ts          # Helper functions
│   └── constants.ts      # App constants
├── actions/              # Server actions
│   └── events/           # Event actions
├── middleware/           # Custom middleware
├── public/               # Static assets
└── package.json          # Dependencies
```

---

## 🛡️ Error Handling

### API Error Codes Reference

| Code | Status | Meaning | Example |
|------|--------|---------|---------|
| 200 | OK | Request successful | Events fetched |
| 201 | Created | Resource created | Event created |
| 400 | Bad Request | Invalid request | Missing/invalid slug |
| 404 | Not Found | Resource not found | Event not found |
| 500 | Internal Server Error | Server error | DB connection failed |

### Error Response Pattern

All error responses follow this structure:

```json
{
  "message": "Human-readable error message",
  "error": "Technical error details (optional)"
}
```

### Common Error Scenarios & Solutions

| Scenario | Error | Solution |
|----------|-------|----------|
| Missing slug | "Invalid slug parameter" | Provide valid slug in URL |
| Invalid characters | "Slug contains invalid characters" | Use only a-z, 0-9, hyphens |
| Event missing | "Event not found" | Verify slug or check database |
| DB not connected | "MONGODB_URI not defined" | Add to .env.local |
| Image upload fails | "Currently unable to create" | Check Cloudinary credentials |

---

## ✅ Best Practices Implemented

### 1. **Type Safety**
- TypeScript strict mode enabled
- Interface definitions for all data structures
- No `any` types in production code
- Generic types for responses

### 2. **Database**
- Mongoose schema validation
- Pre-save hooks for data normalization
- Indexes for query optimization
- Lean queries for read operations

### 3. **API Design**
- RESTful endpoints
- Consistent response structure
- Proper HTTP status codes
- Error messages with context

### 4. **Performance**
- Connection pooling (5-10 connections)
- Read-only lean queries
- Indexed database fields
- Cloudinary CDN for images

### 5. **Security**
- Input validation (slug format)
- Email validation regex
- Environment variables for secrets
- Pre-save hooks for data integrity

### 6. **Code Organization**
- Separation of concerns
- Reusable components
- Utility functions centralized
- Clear file structure

### 7. **Next.js Best Practices**
- Server components by default
- Client components marked with `'use client'`
- Image optimization with Next.js Image
- App router with dynamic routes

---

## 📝 API Usage Examples

### Example 1: Fetch Home Page Events

```typescript
// app/page.tsx
const response = await fetch(`${BASE_URL}/api/events`);
const { events } = await response.json();

events.forEach(event => {
  console.log(`${event.title} - ${event.date}`);
});
```

### Example 2: Fetch Event Details

```typescript
// app/events/[slug]/page.tsx
const response = await fetch(`${BASE_URL}/api/events/${slug}`);
const { event } = await response.json();

console.log(`Event: ${event.title}`);
console.log(`Location: ${event.location}`);
console.log(`Date: ${event.date} at ${event.time}`);
```

### Example 3: Get Similar Events

```typescript
// actions/events/getSimilarEvent.ts
const similarEvents = await getSimilarEvents("react-summit-2026");

// Returns events with matching tags, excluding current event
similarEvents.forEach(event => {
  console.log(event.title); // Same tags but different event
});
```

### Example 4: Create Event with Image

```javascript
// Admin/organizer functionality
const formData = new FormData();
formData.append('title', 'My Conference 2026');
formData.append('image', imageFile);
formData.append('date', '2026-06-15');
formData.append('agenda', JSON.stringify(['Session 1', 'Session 2']));
formData.append('tags', JSON.stringify(['tech', 'conference']));
// ... other fields

const response = await fetch('/api/events', {
  method: 'POST',
  body: formData
});
```

---

## 🔐 Security Considerations

### Current Implementation

✅ Environment variables for sensitive data
✅ Input validation (slug format, email format)
✅ Database referential integrity (booking → event)
✅ Pre-save hooks for data normalization

### Recommended Enhancements

🔒 Add authentication/authorization
🔒 Implement CORS policies
🔒 Add rate limiting
🔒 Sanitize user inputs
🔒 Add request validation middleware
🔒 Implement API key authentication for admin endpoints

---

## 🐛 Testing

### Manual Testing Checklist

- [ ] Home page loads and displays events
- [ ] Event details page fetches correct event by slug
- [ ] Similar events section shows related events
- [ ] Email form submits successfully
- [ ] Invalid slug shows 404
- [ ] Create event endpoint accepts form data with image
- [ ] Cloudinary image upload works
- [ ] Database queries are optimized

---

## 📞 Support & Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Check `MONGODB_URI` in `.env.local`
- Verify network access in MongoDB Atlas
- Ensure connection string includes credentials

**Cloudinary Upload Failed**
- Verify API credentials in `.env.local`
- Check folder name in API call
- Ensure image file is valid

**Event Not Found (404)**
- Verify slug matches exactly (case-sensitive after conversion)
- Check event exists in database
- Ensure slug format is valid

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Mongoose Guide](https://mongoosejs.com/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Cloudinary API Docs](https://cloudinary.com/documentation)

---

**Last Updated:** January 16, 2026
**Version:** 1.0.0
**Status:** Production Ready
