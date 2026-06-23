import express from "express";
import cors from "cors";
import mylog from "../logging-middleware/src/logger.js";

const app = express();

app.use(cors());
app.use(express.json());

const notifications = [
  {
    id: 1,
    title: "Google Campus Drive 2026",
    content: "Google is hosting a campus recruitment drive for Software Engineering roles. Register before June 30.",
    type: "Placement",
    date: "2026-06-23T10:00:00Z",
    read: false
  },
  {
    id: 2,
    title: "Semester Results Announced",
    content: "The results for the Spring 2026 semester are now available on the student portal. Please check your grades.",
    type: "Result",
    date: "2026-06-22T08:30:00Z",
    read: false
  },
  {
    id: 3,
    title: "Annual Hackathon 'Hack-It-All'",
    content: "Registration is now open for the annual campus hackathon. Teams of 3-4 members are allowed. Cash prizes up to $5000!",
    type: "Event",
    date: "2026-06-21T14:00:00Z",
    read: true
  },
  {
    id: 4,
    title: "Microsoft Placement Interview Schedule",
    content: "The interview schedule for students shortlisted in Microsoft campus drive has been released. Check your email for slots.",
    type: "Placement",
    date: "2026-06-20T09:00:00Z",
    read: true
  },
  {
    id: 5,
    title: "Guest Lecture on Artificial Intelligence",
    content: "Join us for a guest lecture by Dr. Alan Turing on the future of AI. Venue: Seminar Hall 1, 10 AM.",
    type: "Event",
    date: "2026-06-19T11:00:00Z",
    read: true
  }
];

app.get("/", async (req, res) => {
  await mylog("backend", "info", "route", "GET / called");
  res.send("Server Running!");
});

app.get("/api/notifications", async (req, res) => {
  const { page = 1, limit = 2, filter } = req.query;

  await mylog(
    "backend",
    "info",
    "route",
    `GET /api/notifications called - page: ${page}, limit: ${limit}, filter: ${filter}`
  );

  // Validate filter input
  const validFilters = ["All", "Placement", "Result", "Event"];
  if (filter && !validFilters.includes(filter)) {
    await mylog("backend", "error", "handler", "Invalid request");
    return res.status(400).json({ error: "Invalid filter type" });
  }

  let filtered = notifications;
  if (filter && filter !== "All") {
    filtered = notifications.filter(
      (n) => n.type.toLowerCase() === filter.toLowerCase()
    );
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;

  const paginated = filtered.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filtered.length / limitNum);

  res.json({
    notifications: paginated,
    totalPages,
    total: filtered.length
  });
});

app.listen(3000, async () => {
  await mylog("backend", "info", "service", "Server started");
  console.log("Server running on port 3000!");
});