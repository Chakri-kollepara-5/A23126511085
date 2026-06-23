const mylog = async (stack, level, packageName, message) => {
  try {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJrb2xsZXBhcmF2ZW5rYXRhc3JpY2hha3JhdmFydGhpLjIzLml0QGFuaXRzLmVkdS5pbiIsImV4cCI6MTc4MjE5MzgyNCwiaWF0IjoxNzgyMTkyOTI0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZjA2YTE3YjItMzFhNy00NGU0LThjMjUtZGY2MDQzNzZlN2M5IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoia29sbGVwYXJhIHZlbmthdGEgc3JpIGNoYWtyYXZhcnRoaSIsInN1YiI6IjNmY2Q0ZjkzLWZlMTctNDVjNS04YmQxLTdlNGZkYzkyZWFhYSJ9LCJlbWFpbCI6ImtvbGxlcGFyYXZlbmthdGFzcmljaGFrcmF2YXJ0aGkuMjMuaXRAYW5pdHMuZWR1LmluIiwibmFtZSI6ImtvbGxlcGFyYSB2ZW5rYXRhIHNyaSBjaGFrcmF2YXJ0aGkiLCJyb2xsTm8iOiJhMjMxMjY1MTEwODUiLCJhY2Nlc3NDb2RlIjoiTVRxeGFyIiwiY2xpZW50SUQiOiIzZmNkNGY5My1mZTE3LTQ1YzUtOGJkMS03ZTRmZGM5MmVhYWEiLCJjbGllbnRTZWNyZXQiOiJLQUVoTXlFd25xYmtOYWJ3In0.ZqMa1BAh7bwLtxmkR5TkaEIqAK5_317LkeKcAJRVq30";

    const response = await fetch(
      "http://4.224.186.213/evaluation-service/logs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          stack,
          level,
          package: packageName,
          message,
        }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Logger Error:", error);
  }
};

export default mylog;