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
