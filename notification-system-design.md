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



## SQL Queries

### INSERT (Create Notification)
```sql
INSERT INTO notifications (id, student_id, type, title, message, is_read, created_at)
VALUES ('notif_001', '123', 'Placement', 'Placement Update', 'Congratulations!', FALSE, NOW());
```

### SELECT 
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
