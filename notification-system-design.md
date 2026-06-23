# Notification System Design

## Stage 1: API Design

### Authentication

All APIs require a JWT token.

```
Authorization: Bearer <token>
```

### Create Notification

**POST** `/api/notifications`

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
  "notificationId": "001"
}
```

---

### Get Notifications

**GET** `/api/notifications`

Query Parameters:

* page
* limit
* type

Example:

```
/api/notifications?page=1&limit=10&type=Placement
```

Response:

```json
{
  "notifications": [],
  "total": 20
}
```

---

### Mark as Read

**PATCH** `/api/notifications/:id/read`

Response:

```json
{
  "success": true
}
```

---

### Delete Notification

**DELETE** `/api/notifications/:id`

Response:

```json
{
  "success": true
}
```

---

### Real-Time Notifications

WebSocket Connection:

```
ws://localhost:3000/notifications
```

Client sends:

```json
{
  "token": "<token>"
}
```

Server sends:

```json
{
  "id": "001",
  "title": "Placement Update",
  "message": "Congratulations!"
}
```

---

# Stage 2: Database Design

## Why PostgreSQL?

I selected PostgreSQL because:

* Reliable and widely used
* Supports relationships between tables
* Good performance for large datasets
* Easy indexing support
* Supports JSON data when needed

---

## Students Table

```sql
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE
);
```

## Notifications Table

```sql
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50),
    title VARCHAR(200),
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
    REFERENCES students(id)
);
```

Index:

```sql
CREATE INDEX idx_student_read
ON notifications(student_id, is_read);
```

---

## Basic Queries

Create Notification

```sql
INSERT INTO notifications
VALUES (
'001',
'123',
'Placement Update',
'Congratulations!',
'Placement',
FALSE,
NOW()
);
```

Get Notifications

```sql
SELECT *
FROM notifications
WHERE student_id='123'
ORDER BY created_at DESC
LIMIT 10;
```

Mark as Read

```sql
UPDATE notifications
SET is_read = TRUE
WHERE id='001';
```

Delete Notification

```sql
DELETE FROM notifications
WHERE id='001';
```

---

# Stage 3: Query Optimization

Problem Query:

```sql
SELECT *
FROM notifications
WHERE student_id = '123'
AND is_read = FALSE
ORDER BY created_at;
```

### Issue

If millions of records exist, PostgreSQL may take longer to search and sort the data.

### Solution

Create a composite index:

```sql
CREATE INDEX idx_notification_search
ON notifications(student_id, is_read, created_at);
```

Benefits:

* Faster filtering
* Faster sorting
* Reduced query execution time

---

# Stage 4: Improving Performance

### Redis Cache

Store frequently accessed notification data in Redis.

Flow:

```
Frontend
   ↓
Redis
   ↓
PostgreSQL
```

If data exists in Redis, return it directly.

Otherwise:

1. Fetch from PostgreSQL
2. Store in Redis
3. Return response

---

### Pagination

Instead of loading everything:

```http
GET /api/notifications?page=1&limit=20
```

This reduces response size and improves speed.

---

### Infinite Scroll

Load first 20 notifications.

When the user scrolls down, fetch the next set automatically.

---

### WebSockets

New notifications are pushed instantly without refreshing the page.

---

# Stage 5: Handling Large Notification Traffic

Current Approach

```python
for student in students:
    send_email(student)
    save_notification(student)
```

Problem:

* Slow processing
* One failure can affect others

---

### Better Approach

Use a queue.

Flow:

```
Admin
  ↓
Notification API
  ↓
Queue
  ↓
Worker
   ├── Save to Database
   ├── Send Email
   └── Send WebSocket Notification
```

### Queue Example

```python
for student in students:
    add_to_queue(student, message)
```

Worker:

```python
while queue_has_items():
    notification = get_next_item()

    save_to_database(notification)
    send_email(notification)
    send_realtime_notification(notification)
```

### Advantages

* Faster processing
* Retry failed jobs
* Better scalability
* Handles large number of users efficiently
