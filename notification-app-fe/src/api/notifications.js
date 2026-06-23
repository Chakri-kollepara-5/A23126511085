export async function fetchNotifications(page = 1, filter = "All") {
  const url = `http://localhost:3000/api/notifications?page=${page}&filter=${filter}&limit=2`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.json();
}
