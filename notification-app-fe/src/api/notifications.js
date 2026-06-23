const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJrb2xsZXBhcmF2ZW5rYXRhc3JpY2hha3JhdmFydGhpLjIzLml0QGFuaXRzLmVkdS5pbiIsImV4cCI6MTc4MjE5MzgyNCwiaWF0IjoxNzgyMTkyOTI0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZjA2YTE3YjItMzFhNy00NGU0LThjMjUtZGY2MDQzNzZlN2M5IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoia29sbGVwYXJhIHZlbmthdGEgc3JpIGNoYWtyYXZhcnRoaSIsInN1YiI6IjNmY2Q0ZjkzLWZlMTctNDVjNS04YmQxLTdlNGZkYzkyZWFhYSJ9LCJlbWFpbCI6ImtvbGxlpY2h...ZqMa1BAh7bwLtxmkR5TkaEIqAK5_317LkeKcAJRVq30";

const staticMockNotifications = [
  {
    id: "mock_1",
    title: "Google Campus Drive 2026",
    content: "Google software engineering campus recruitment drive registration is now open.",
    type: "Placement",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false
  },
  {
    id: "mock_2",
    title: "Semester Results Released",
    content: "Grades for the Spring 2026 semester have been published on the student portal.",
    type: "Result",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    read: false
  },
  {
    id: "mock_3",
    title: "National Coding Challenge",
    content: "Register for the national hackathon event with cash prizes up to $5000.",
    type: "Event",
    created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hours ago
    read: true
  },
  {
    id: "mock_4",
    title: "Microsoft Interview Invites",
    content: "Shortlisted candidates for Microsoft interviews have been notified via email.",
    type: "Placement",
    created_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 24 hours ago
    read: true
  },
  {
    id: "mock_5",
    title: "AI Workshop",
    content: "Join the guest lecture on LLMs and transformer architectures in Seminar Hall 1.",
    type: "Event",
    created_at: new Date(Date.now() - 1000 * 60 * 2880).toISOString(), // 48 hours ago
    read: true
  }
];

// Fetch from evaluation service (or fallback)
export async function fetchEvaluationNotifications() {
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
  } catch (err) {
    console.warn("Failed to reach evaluation service. Falling back to static mock data.", err);
  }
  return { notifications: staticMockNotifications };
}

// Fetch from local backend (or fallback)
export async function fetchLocalNotifications(page = 1, filter = "All") {
  try {
    const url = `http://localhost:3000/api/notifications?page=${page}&filter=${filter}&limit=2`;
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn("Failed to reach local backend. Falling back to static mock data.", err);
  }

  // Client-side pagination fallback for static mock data
  let filtered = staticMockNotifications;
  if (filter && filter !== "All") {
    filtered = staticMockNotifications.filter(
      (n) => n.type.toLowerCase() === filter.toLowerCase()
    );
  }
  const limit = 2;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  return {
    notifications: filtered.slice(startIndex, endIndex),
    totalPages: Math.ceil(filtered.length / limit),
    total: filtered.length
  };
}
