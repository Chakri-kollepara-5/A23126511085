# Stage 1

## Authentication

Authorization: Bearer <token>

## Create Notification

POST /api/v1/notifications

Request:
```json
{
  "userId": "123",
  "title": "Placement Update",
  "message": "Congratulations!",
  "type": "Placement"
}
```

Response:
```json
{
  "success": true,
  "notificationId": "notif_001"
}
```

## Get Notifications

GET /api/v1/notifications

Request parameters (Query):
- `page` (optional): Page number (e.g. `1`)
- `limit` (optional): Number of items per page (e.g. `10`)
- `filter` (optional): Filter type (e.g. `Placement`, `Result`, `Event`)

Response:
```json
{
  "notifications": [
    {
      "id": "notif_001",
      "userId": "123",
      "title": "Placement Update",
      "message": "Congratulations!",
      "type": "Placement",
      "read": false,
      "createdAt": "2026-06-23T10:00:00Z"
    }
  ],
  "totalPages": 1,
  "total": 1
}
```

## Mark Notification as Read

PATCH /api/v1/notifications/:id/read

Response:
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## Delete Notification

DELETE /api/v1/notifications/:id

Response:
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

## WebSocket for Real-Time Updates

Establish connection via WebSocket:
`ws://localhost:3000/notifications`

On Connection / Subscription:
Send authorization payload:
```json
{
  "type": "auth",
  "token": "<token>"
}
```

On New Notification:
Server pushes message to client:
```json
{
  "type": "notification",
  "data": {
    "id": "notif_001",
    "title": "Placement Update",
    "message": "Congratulations!",
    "type": "Placement",
    "createdAt": "2026-06-23T10:00:00Z"
  }
}
```

---

# Stage 2

## Database: PostgreSQL

### Why PostgreSQL
- **ACID Compliance**: Ensures reliable transactions for critical notifications (e.g., results, placements).
- **Strong Typing & Schema Integrity**: Prevents malformed logs or missing fields.
- **Support for Indexes**: Efficient query performance using B-Tree and Hash indexes on foreign keys (`student_id`) and status fields (`is_read`).
- **Rich Feature Set**: Includes native partitioning, JSONB type support for custom payloads, and robust connection pooling integrations.

---

## Schema & Tables

### 1. Students Table
Stores user/student details.
```sql
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);
```

### 2. Notifications Table
Stores all notifications and maps them to a student.
```sql
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for optimized lookup by student and read status
CREATE INDEX idx_notifications_student_read ON notifications(student_id, is_read);
```

---

## Scale & Performance Architecture

### Scaling Challenges
- **High Read/Write Ratio**: Notifications are written once but read frequently (polling or paginating).
- **Table Bloat**: As millions of notifications accumulate, queries slow down due to index size exceeding RAM limits.

### Redis Caching
- Cache unread notification counts per student in Redis (Key: `unread_count:{student_id}`) for fast badge render times.
- Cache the first page of notifications (latest 10-20 items) to reduce database load. Invalidated on new notification inserts.

### Partitioning
- Partition the `notifications` table by **Range** using the `created_at` timestamp (e.g., monthly partitions).
- This allows dropping/archiving old partitions easily without table locks and keeps index sizes small for active months.

---

## SQL Queries

### INSERT (Create Notification)
```sql
INSERT INTO notifications (id, student_id, type, title, message, is_read, created_at)
VALUES ('notif_001', '123', 'Placement', 'Placement Update', 'Congratulations!', FALSE, NOW());
```

### SELECT (Get Paginated Notifications for a Student)
```sql
SELECT n.id, n.type, n.title, n.message, n.is_read, n.created_at, s.name, s.email
FROM notifications n
JOIN students s ON n.student_id = s.id
WHERE n.student_id = '123'
ORDER BY n.created_at DESC
LIMIT 10 OFFSET 0;
```

### UPDATE (Mark Notification as Read)
```sql
UPDATE notifications
SET is_read = TRUE
WHERE id = 'notif_001' AND student_id = '123';
```

### DELETE (Delete Notification)
```sql
DELETE FROM notifications
WHERE id = 'notif_001' AND student_id = '123';
```

---

# Stage 3 — Query Optimization

## Problem Query Analysis
The following query is used to retrieve unread notifications for a specific student, sorted by date:

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

### The Bottleneck
- **Full Table Scan**: Without an appropriate index, PostgreSQL must perform a sequential scan across the entire table to filter by `studentID` and `isRead`.
- **5 Million Notifications**: Scanning a table of this scale results in high disk I/O, heavy CPU usage, and high latency.
- **Slow Sorting**: Sorting the filtered results by `createdAt` forces an in-memory or disk-based sort (external merge sort) if the volume of unread notifications is large, further degrading query response times.

---

## Indexing Solution
To optimize this, we create a composite index targeting the search criteria and sort order:

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt);
```

### Why not index every column?
While indexes speed up lookups, indexing every column is a bad practice due to:
- **Higher Storage Overhead**: Indexes occupy significant physical disk space, sometimes exceeding the size of the raw table data itself.
- **Slower INSERTs**: Every new row insertion requires the database engine to recalculate and write entries into every index defined on the table.
- **Slower UPDATEs**: Modifying a value in an indexed column forces the engine to remove the old index entry and write a new one, causing index fragmentation and page splits.

---

## Placement Notifications (Last 7 Days)
To query only placement notifications from the last week:

```sql
SELECT *
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```

---

# Stage 4 — Performance Improvement

## Problem: Redundant Database Lookups
Currently, every page load triggers direct reads to the database. At scale, this results in high database CPU utilization, connection pool exhaustion, and increased read latency for users.

---

## Solutions

### 1. Redis Cache Layer
To offload queries from the primary database, a caching layer is introduced. 

```
Frontend 
   ↓ 
Redis Cache (Checks for cached notifications)
   ↓ (If Cache Miss)
Database
```

- **Cache-Aside Pattern**: On notification query, the server first checks Redis. If the data exists (Cache Hit), it returns it immediately. If not (Cache Miss), it fetches from PostgreSQL, populates the Redis cache (with an appropriate TTL like 15 minutes), and returns the payload.
- **Cache Invalidation**: When a new notification is created for a user, the corresponding cached notifications index in Redis is cleared or appended to keep the client feed synchronized.

### 2. Pagination
Instead of loading a student's entire notification history, feeds are paginated using limit and offset queries to reduce payload sizes and database read times.
- **Endpoint Pattern**: `GET /api/v1/notifications?page=1&limit=20`

### 3. Lazy Loading & Infinite Scroll
- On the frontend client, we only fetch the first 20 records.
- As the user scrolls near the bottom of the viewport, the next page is requested and appended to the UI state. This prevents loading records that the user may never view.

### 4. Background Refresh & Optimistic UI Updates
- **Background Refresh**: The frontend queries cached records instantly for immediate rendering, then fetches updates in the background to update the feed without blocking user interactions.
- **Real-Time Synchronicity**: WebSockets push new notifications directly to the browser. Instead of reloading the page or making a full REST API call, the new item is pushed onto the active frontend list state.

---

# Stage 5 — Asynchronous Processing & Fault Tolerance

## Shortcomings of Current Implementation
The current implementation processes notifications sequentially:

```python
for student_id in student_ids:
    send_email(student_id, message)
    save_to_db(student_id, message)
    push_to_app(student_id, message)
```

### Issues:
1. **Single Point of Failure**: If `send_email()` fails or throws an exception, the entire loop terminates, halting delivery for remaining students.
2. **No Retry Logic**: Transient network or SMTP errors result in permanent notification delivery loss.


---

## Proposed Solution: Queue-Based Architecture
To decouple components, notifications are offloaded to an asynchronous message queue (e.g., RabbitMQ or Redis BullMQ).

```
HR 
 ↓ 
Notification API 
 ↓ 
Message Queue 
 ↓ 
Worker Service 
 ├── Save Notification to DB 
 ├── Send Email 
 └── Send In-App Notification (WebSocket)
```

---



## Revised Pseudocode

### Enqueue Process
```python
for student_id in student_ids:
    add_to_queue(student_id, message)
```


