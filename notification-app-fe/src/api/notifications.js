const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJrb2xsZXBhcmF2ZW5rYXRhc3JpY2hha3JhdmFydGhpLjIzLml0QGFuaXRzLmVkdS5pbiIsImV4cCI6MTc4MjE5MzgyNCwiaWF0IjoxNzgyMTkyOTI0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZjA2YTE3YjItMzFhNy00NGU0LThjMjUtZGY2MDQzNzZlN2M5IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoia29sbGVwYXJhIHZlbmthdGEgc3JpIGNoYWtyYXZhcnRoaSIsInN1YiI6IjNmY2Q0ZjkzLWZlMTctNDVjNS04YmQxLTdlNGZkYzkyZWFhYSJ9LCJlbWFpbCI6ImtvbGxlpY2h...ZqMa1BAh7bwLtxmkR5TkaEIqAK5_317LkeKcAJRVq30";

export async function fetchNotifications() {
  try {
    const url = "http://4.224.186.213/evaluation-service/notifications";
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${TOKEN}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
    console.warn(`Evaluation service returned status ${response.status}. Falling back to local backend.`);
  } catch (err) {
    console.warn("Failed to reach evaluation service. Falling back to local backend.", err);
  }

  // Fallback to local backend
  const localUrl = "http://localhost:3000/api/notifications?limit=100";
  const localResponse = await fetch(localUrl);
  if (!localResponse.ok) {
    throw new Error("Failed to fetch notifications from local backend fallback");
  }
  return await localResponse.json();
}
