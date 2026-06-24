# System Screenshots

This folder contains screenshots of the Notification Portal during various phases of evaluation.

## Screen Index

1. **`error_log_payload.jpg`**
   * **Description**: Shows the successful integration of the logging middleware. The frontend captures syntax compiler errors (such as the redeclaration of `mylog`) and dispatches them via REST POST requests to the logging endpoint, returning a `201 Created` response.
   
2. **`top_n_filter.jpg`**
   * **Description**: Displays the selection interface for the **Top N** priority notification filters (Top 3, Top 5, Top 10, All Items).
   
3. **`mobile_notifications_portal.jpg`**
   * **Description**: Responsive Mobile layout render of the Notification Portal, showing category tags, new item badges, and chronological pagination.
   
4. **`desktop_notifications_portal.jpg`**
   * **Description**: Responsive Desktop layout render of the Notification Portal, demonstrating cards with styled action containers.

5. **`evaluation_registration.jpg`**
   * **Description**: Shows the registration request and response for the evaluation service (POST `/evaluation-service/register`), returning a `200 OK` status with the generated `clientID` and `clientSecret`.

6. **`evaluation_notifications.jpg`**
   * **Description**: Displays the notifications fetched from the evaluation service (GET `/evaluation-service/notifications`), showing a list of recent notification results and events.
