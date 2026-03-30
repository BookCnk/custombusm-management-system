# API Documentation - Bus Management System

## Base URL
```
http://localhost:3000/api
```

---

## Authentication

### POST /auth/login
Login admin user.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "id": 1,
  "username": "admin",
  "message": "Login successful"
}
```

**Errors:**
- `400` - Missing username or password
- `401` - Invalid credentials

### POST /auth/register
Register new admin (for initial setup).

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "id": 1,
  "username": "admin",
  "message": "User created successfully"
}
```

---

## Buses (รถบัส)

### GET /buses
Get all buses.

**Response (200):**
```json
[
  {
    "id": 1,
    "busNumber": "815-1",
    "totalSeats": 40,
    "schedules": []
  }
]
```

### POST /buses
Create new bus.

**Request Body:**
```json
{
  "busNumber": "VIP-01",
  "totalSeats": 40
}
```

**Response (201):**
```json
{
  "id": 2,
  "busNumber": "VIP-01",
  "totalSeats": 40
}
```

**Errors:**
- `400` - Missing busNumber
- `409` - Bus number already exists

### GET /buses/:id
Get bus by ID with schedules.

**Response (200):**
```json
{
  "id": 1,
  "busNumber": "815-1",
  "totalSeats": 40,
  "schedules": [
    {
      "id": 1,
      "departureDate": "2026-04-01T00:00:00.000Z",
      "departureTime": "08:30"
    }
  ]
}
```

**Errors:**
- `404` - Bus not found

### PATCH /buses/:id
Update bus.

**Request Body:**
```json
{
  "busNumber": "815-2",
  "totalSeats": 45
}
```

**Response (200):**
```json
{
  "id": 1,
  "busNumber": "815-2",
  "totalSeats": 45
}
```

### DELETE /buses/:id
Delete bus.

**Response (200):**
```json
{
  "message": "Bus deleted successfully"
}
```

**Errors:**
- `404` - Bus not found
- `409` - Cannot delete bus with existing schedules

---

## Routes (เส้นทาง)

### GET /routes
Get all routes with stations.

**Response (200):**
```json
[
  {
    "id": 1,
    "routeName": "ราชสีมา - ระยอง",
    "stations": [
      {
        "id": 1,
        "stationName": "ปักธงชัย",
        "stopOrder": 1
      },
      {
        "id": 2,
        "stationName": "กบินทร์",
        "stopOrder": 2
      }
    ]
  }
]
```

### POST /routes
Create new route with optional stations.

**Request Body:**
```json
{
  "routeName": "ราชสีมา - ระยอง",
  "stations": [
    { "stationName": "ปักธงชัย", "stopOrder": 1 },
    { "stationName": "กบินทร์", "stopOrder": 2 },
    { "stationName": "บ่อวิน", "stopOrder": 3 }
  ]
}
```

**Response (201):**
```json
{
  "id": 1,
  "routeName": "ราชสีมา - ระยอง",
  "stations": [...]
}
```

**Errors:**
- `400` - Missing routeName

### GET /routes/:id
Get route by ID with stations and schedules.

### PATCH /routes/:id
Update route name.

**Request Body:**
```json
{
  "routeName": "โคราช - ระยอง"
}
```

### DELETE /routes/:id
Delete route.

**Errors:**
- `409` - Cannot delete route with existing schedules

---

## Stations (จุดจอด)

### GET /stations
Get all stations (optionally filtered by routeId).

**Query Parameters:**
- `routeId` - Filter by route ID

**Example:** `GET /stations?routeId=1`

**Response (200):**
```json
[
  {
    "id": 1,
    "routeId": 1,
    "stationName": "ปักธงชัย",
    "stopOrder": 1,
    "route": {...}
  }
]
```

### POST /stations
Create new station.

**Request Body:**
```json
{
  "routeId": 1,
  "stationName": "บ่อวิน",
  "stopOrder": 3
}
```

**Response (201):**
```json
{
  "id": 3,
  "routeId": 1,
  "stationName": "บ่อวิน",
  "stopOrder": 3,
  "route": {...}
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Route not found (P2003)

### GET /stations/:id
Get station by ID.

### PATCH /stations/:id
Update station.

**Request Body:**
```json
{
  "stationName": "บ่อวิน มินิ",
  "stopOrder": 4
}
```

### DELETE /stations/:id
Delete station.

**Errors:**
- `409` - Cannot delete station with existing bookings

---

## Schedules (ตารางเดินรถ)

### GET /schedules
Get all schedules with filters.

**Query Parameters:**
- `routeId` - Filter by route
- `busId` - Filter by bus
- `date` - Filter by date (YYYY-MM-DD)

**Example:** `GET /schedules?routeId=1&date=2026-04-01`

**Response (200):**
```json
[
  {
    "id": 1,
    "busId": 1,
    "routeId": 1,
    "departureDate": "2026-04-01T00:00:00.000Z",
    "departureTime": "08:30",
    "bus": {...},
    "route": {
      "...",
      "stations": [...]
    },
    "bookings": [
      { "seatNumber": "A1", "status": "CONFIRMED" }
    ]
  }
]
```

### POST /schedules
Create new schedule.

**Request Body:**
```json
{
  "busId": 1,
  "routeId": 1,
  "departureDate": "2026-04-01",
  "departureTime": "08:30"
}
```

**Response (201):**
```json
{
  "id": 1,
  "busId": 1,
  "routeId": 1,
  "departureDate": "2026-04-01T00:00:00.000Z",
  "departureTime": "08:30",
  "bus": {...},
  "route": {...}
}
```

### GET /schedules/:id
Get schedule with full details including bookings.

### PATCH /schedules/:id
Update schedule.

**Request Body:**
```json
{
  "departureTime": "09:00",
  "busId": 2
}
```

### DELETE /schedules/:id
Delete schedule.

**Errors:**
- `409` - Cannot delete schedule with existing bookings

---

## Bookings (การจอง)

### GET /bookings
Get all bookings (optionally filtered).

**Query Parameters:**
- `scheduleId` - Filter by schedule
- `passengerPhone` - Filter by passenger phone

**Response (200):**
```json
[
  {
    "id": 1,
    "scheduleId": 1,
    "seatNumber": "A1",
    "passengerName": "สมชาย",
    "passengerPhone": "0812345678",
    "pickupStationId": 1,
    "dropoffStationId": 3,
    "price": 350,
    "status": "CONFIRMED",
    "createdAt": "2026-03-31T10:00:00.000Z",
    "schedule": {...},
    "pickupStation": {...},
    "dropoffStation": {...}
  }
]
```

### POST /bookings
Create new booking.

**Request Body:**
```json
{
  "scheduleId": 1,
  "seatNumber": "A1",
  "passengerName": "สมชาย",
  "passengerPhone": "0812345678",
  "pickupStationId": 1,
  "dropoffStationId": 3,
  "price": 350
}
```

**Response (201):**
```json
{
  "id": 1,
  "scheduleId": 1,
  "seatNumber": "A1",
  "passengerName": "สมชาย",
  "passengerPhone": "0812345678",
  "pickupStationId": 1,
  "dropoffStationId": 3,
  "price": 350,
  "status": "CONFIRMED",
  "createdAt": "2026-03-31T10:00:00.000Z",
  "schedule": {...},
  "pickupStation": {...},
  "dropoffStation": {...}
}
```

**Errors:**
- `400` - Missing required fields
- `404` - Schedule or Station not found
- `409` - Seat already booked for this schedule (P2002)

### GET /bookings/:id
Get booking by ID.

### PATCH /bookings/:id
Update booking.

**Request Body:**
```json
{
  "seatNumber": "B2",
  "passengerName": "สมหญิง",
  "status": "CANCELLED"
}
```

**Note:** seatNumber จะถูกแปลงเป็นตัวพิมพ์ใหญ่อัตโนมัติ

### DELETE /bookings/:id
Delete booking.

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Missing required fields |
| 401 | Unauthorized - Invalid credentials |
| 404 | Not Found |
| 409 | Conflict - Duplicate or foreign key constraint |
| 500 | Server Error |

### Prisma Error Codes

| Code | Meaning |
|------|---------|
| P2002 | Unique constraint violation (duplicate) |
| P2003 | Foreign key constraint failed |
| P2025 | Record not found |

---

## Common Workflows

### 1. Create Full Route with Stations
```bash
POST /routes
{
  "routeName": "ราชสีมา - ระยอง",
  "stations": [
    { "stationName": "ปักธงชัย", "stopOrder": 1 },
    { "stationName": "กบินทร์", "stopOrder": 2 },
    { "stationName": "บ่อวิน", "stopOrder": 3 }
  ]
}
```

### 2. Create Schedule and Book Seat
```bash
# 1. Create schedule
POST /schedules
{
  "busId": 1,
  "routeId": 1,
  "departureDate": "2026-04-01",
  "departureTime": "08:30"
}

# 2. Book seat
POST /bookings
{
  "scheduleId": 1,
  "seatNumber": "A1",
  "passengerName": "สมชาย",
  "passengerPhone": "0812345678",
  "pickupStationId": 1,
  "dropoffStationId": 3,
  "price": 350
}
```

### 3. Check Available Seats
```bash
GET /schedules/1
# ดูที่นั่งที่ถูกจองแล้วจาก bookings array
# เปรียบเทียบกับ bus.totalSeats เพื่อหาที่นั่งว่าง
```

---

## Data Types

### Bus
- `id`: Integer (auto)
- `busNumber`: String (unique)
- `totalSeats`: Integer (default: 40)

### Route
- `id`: Integer (auto)
- `routeName`: String
- `stations`: RouteStation[]

### RouteStation
- `id`: Integer (auto)
- `routeId`: Integer
- `stationName`: String
- `stopOrder`: Integer

### Schedule
- `id`: Integer (auto)
- `busId`: Integer
- `routeId`: Integer
- `departureDate`: DateTime
- `departureTime`: String (HH:MM)

### Booking
- `id`: Integer (auto)
- `scheduleId`: Integer
- `seatNumber`: String
- `passengerName`: String?
- `passengerPhone`: String?
- `pickupStationId`: Integer
- `dropoffStationId`: Integer
- `price`: Float
- `status`: String (CONFIRMED/CANCELLED)
- `createdAt`: DateTime

### User
- `id`: Integer (auto)
- `username`: String (unique)
- `password`: String
