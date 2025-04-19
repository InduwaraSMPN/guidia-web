require("dotenv").config();
const express = require("express");
const http = require("http");
const mysql = require("mysql2/promise");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const multer = require("multer");
const { BlobServiceClient } = require("@azure/storage-blob");
const bcrypt = require("bcrypt");
const { Server } = require("socket.io");
const getOTPEmailTemplate = require("./email-templates/otp-template");
const getRegistrationPendingTemplate = require("./email-templates/registration-pending-template");
const getRegistrationApprovedTemplate = require("./email-templates/registration-approved-template");
const firebaseMessageUtils = require("./utils/firebaseMessageUtils");
const { database } = require("./firebase-admin");
const getRegistrationDeclinedTemplate = require("./email-templates/registration-declined-template");
const getPasswordResetTemplate = require("./email-templates/password-reset-template");
const getWelcomeTemplate = require("./email-templates/welcome-template");
const azureStorageUtils = require("./utils/azureStorageUtils");

// Import key rotation scheduler
const { scheduleKeyRotation } = require("./scripts/schedule-key-rotation");

// Import the authentication middleware
const { verifyToken, verifyAdmin } = require("./middleware/auth");

// Import rate limiters
const {
  authLimiter,
  registrationLimiter,
} = require("./middleware/rateLimiter");

// Import CSRF protection
const {
  csrfProtection,
  csrfTokenGenerator,
} = require("./middleware/csrfProtection");

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Azure Blob Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Email configuration with Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Import and use student routes
const studentRoutes = require("./routes/students");
const counselorsRouter = require("./routes/counselors");
const companiesRouter = require("./routes/companies");
const jobsRouter = require("./routes/jobs");
const messagesRouter = require("./routes/messages");
const meetingRoutes = require("./routes/meetingRoutes");
const notificationsRouter = require("./routes/notifications");
const adminRouter = require("./routes/admin");
const usersRouter = require("./routes/users");
const azureRouter = require("./routes/azure");
const openaiRouter = require("./routes/openai");
const chatHistoryRouter = require("./routes/chatHistory");
const NotificationSocketService = require("./services/notificationSocketService");
const Scheduler = require("./utils/scheduler");
app.use("/api", messagesRouter);

// Basic middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:1030",
    credentials: true,
    exposedHeaders: [
      "X-CSRF-Token",
      "x-csrf-token",
      "Content-Type",
      "Authorization",
    ],
  })
);

// Add middleware to ensure CORS headers are set on all responses
app.use((req, res, next) => {
  // Ensure CORS headers are set
  res.header(
    "Access-Control-Allow-Origin",
    process.env.FRONTEND_URL || "http://localhost:1030"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Expose-Headers",
    "X-CSRF-Token, x-csrf-token, Content-Type, Authorization"
  );
  next();
});
app.use("/api/students", studentRoutes);
app.use("/api/counselors", counselorsRouter);
app.use("/api/companies", companiesRouter);

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verify database connection
pool
  .getConnection()
  .then((connection) => {
    console.log("\x1b[33mSuccessfully connected to MySQL database\x1b[0m");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err.message);
  });

// After creating the pool
app.locals.pool = pool;

// Then use your routes
// Note: We already registered counselors, companies, and students routes above
app.use("/api/jobs", jobsRouter);
app.use("/api/messages", messagesRouter);
console.log("Registering meeting routes...");
app.use("/api/meeting", meetingRoutes);
console.log("Meeting routes registered.");


app.use("/api/admin", adminRouter);
app.use("/api/users", usersRouter);
app.use("/api/azure", azureRouter);
app.use("/api/openai", openaiRouter);
console.log("OpenAI routes registered.");
app.use("/api/chat-history", chatHistoryRouter);
console.log("Chat history routes registered.");

// Initialize notification service with socket service
app.use(
  "/api/notifications",
  (req, res, next) => {
    req.notificationService = new (require("./services/notificationService"))(
      req.app.locals.pool,
      notificationSocketService
    );
    next();
  },
  notificationsRouter
);

// **Endpoints**

// Upload image to Azure Blob Storage
app.post("/api/upload", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const type = req.body.type || "events";
    // First try to get userID from the token, then from the request body
    const userID = (req.user && req.user.id) ? req.user.id : (req.body.userID || null);

    console.log('Upload request from user:', {
      userFromToken: req.user ? req.user.id : 'No token user',
      userFromBody: req.body.userID || 'No body userID',
      finalUserID: userID || 'unknown'
    });

    // Define the blob path based on type and user information
    let blobPath;

    // Handle profile image uploads with the new hierarchical structure
    if (type === "student-profile" || type === "counselor-profile" || type === "company-profile") {
      try {
        // Extract user type from the type parameter
        const userType = type.split('-')[0];
        const capitalizedUserType = userType.charAt(0).toUpperCase() + userType.slice(1);

        // Use the simple path generator when we don't have database access in the request
        blobPath = azureStorageUtils.generateSimpleBlobPath({
          userID: userID,
          userType: capitalizedUserType,
          fileType: 'images',
          originalFilename: req.file.originalname
        });
      } catch (pathError) {
        console.error('Error generating Azure path:', pathError);
        // Fallback to legacy path format but maintain the hierarchical structure
        blobPath = `${type}/${userID || 'unknown'}/images/${Date.now()}-${req.file.originalname}`;
      }
    } else {
      // For non-profile uploads, use the original path format
      blobPath = `${type}/${Date.now()}-${req.file.originalname}`;
    }

    console.log(`Uploading file to Azure path: ${blobPath}`, {
      type,
      userID: userID || 'unknown',
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype },
      metadata: {
        originalName: req.file.originalname,
        size: req.file.size.toString(),
        uploadedBy: userID ? userID.toString() : 'unknown'
      }
    });

    // Return both imagePath and imageURL for consistency
    const imageURL = blockBlobClient.url;
    res.json({
      imagePath: imageURL,
      imageURL: imageURL, // For backward compatibility
      blobPath: blobPath, // Include the blob path for reference
      success: true,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Event endpoints
app.get("/api/events", async (req, res) => {
  try {
    const [events] = await pool.execute(
      "SELECT * FROM events ORDER BY eventDate DESC"
    );
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.get("/api/events/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM events WHERE eventID = ?",
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Event not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const { title, eventDate, imageURL, imagePath } = req.body;
    if (!title || !eventDate || !imageURL || !imagePath) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const [result] = await pool.execute(
      "INSERT INTO events (title, eventDate, imageURL, imagePath) VALUES (?, ?, ?, ?)",
      [title, eventDate, imageURL, imagePath]
    );
    res
      .status(201)
      .json({
        eventID: result.insertId,
        message: "Event created successfully",
      });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

app.put("/api/events/:id", async (req, res) => {
  try {
    const { title, eventDate, imageURL, imagePath } = req.body;
    if (!title || !eventDate)
      return res.status(400).json({ error: "Missing required fields" });

    let query = "UPDATE events SET title = ?, eventDate = ?";
    let params = [title, eventDate];
    if (imageURL) {
      query += ", imageURL = ?";
      params.push(imageURL);
    }
    if (imagePath) {
      query += ", imagePath = ?";
      params.push(imagePath);
    }
    query += " WHERE eventID = ?";
    params.push(req.params.id);

    const [result] = await pool.execute(query, params);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    const [events] = await pool.execute(
      "SELECT imageURL, imagePath FROM events WHERE eventID = ?",
      [req.params.id]
    );
    if (events.length === 0)
      return res.status(404).json({ error: "Event not found" });

    const event = events[0];
    if (event.imagePath) {
      const blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
      const containerClient =
        blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(
        event.imagePath
      );
      try {
        await blockBlobClient.delete();
      } catch (blobError) {
        console.error("Error deleting blob:", blobError);
      }
    }

    await pool.execute("DELETE FROM events WHERE eventID = ?", [req.params.id]);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// News endpoints
app.get("/api/news", async (req, res) => {
  try {
    const [news] = await pool.execute(
      "SELECT * FROM news ORDER BY newsDate DESC"
    );
    res.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.get("/api/news/:id", async (req, res) => {
  try {
    const [news] = await pool.execute("SELECT * FROM news WHERE newsID = ?", [
      req.params.id,
    ]);
    if (news.length === 0)
      return res.status(404).json({ error: "News not found" });
    const newsItem = news[0];
    newsItem.imageURLs = newsItem.imageURLs
      ? JSON.parse(newsItem.imageURLs)
      : [];
    res.json(newsItem);
  } catch (error) {
    console.error("Error fetching news item:", error);
    res.status(500).json({ error: "Failed to fetch news item" });
  }
});

app.post("/api/news", async (req, res) => {
  try {
    const { title, content, newsDate, imageURLs } = req.body;
    if (!title || !content || !newsDate || !imageURLs) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const [result] = await pool.execute(
      "INSERT INTO news (title, content, newsDate, imageURLs) VALUES (?, ?, ?, ?)",
      [title, content, newsDate, JSON.stringify(imageURLs)]
    );
    res
      .status(201)
      .json({ newsID: result.insertId, message: "News created successfully" });
  } catch (error) {
    console.error("Error creating news:", error);
    res.status(500).json({ error: "Failed to create news" });
  }
});

app.put("/api/news/:id", async (req, res) => {
  try {
    const { title, content, imageURLs } = req.body;
    if (!title || !content)
      return res.status(400).json({ error: "Missing required fields" });

    const [existingNews] = await pool.execute(
      "SELECT * FROM news WHERE newsID = ?",
      [req.params.id]
    );
    if (existingNews.length === 0)
      return res.status(404).json({ error: "News not found" });

    const imageURLsJSON = Array.isArray(imageURLs)
      ? JSON.stringify(imageURLs)
      : "[]";
    await pool.execute(
      "UPDATE news SET title = ?, content = ?, imageURLs = ?, updatedAt = NOW() WHERE newsID = ?",
      [title, content, imageURLsJSON, req.params.id]
    );
    res.status(200).json({ message: "News updated successfully" });
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ error: "Failed to update news" });
  }
});

app.delete("/api/news/:id", async (req, res) => {
  try {
    const [news] = await pool.execute(
      "SELECT imageURLs FROM news WHERE newsID = ?",
      [req.params.id]
    );
    if (news.length === 0)
      return res.status(404).json({ error: "News item not found" });

    const imageURLs = JSON.parse(news[0].imageURLs);
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    for (const imageURL of imageURLs) {
      try {
        const blobName = imageURL.replace(`${containerClient.url}/`, "");
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.delete();
      } catch (urlError) {
        console.error("Invalid image URL:", imageURL, urlError);
      }
    }

    await pool.execute("DELETE FROM news WHERE newsID = ?", [req.params.id]);
    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ error: "Failed to delete news" });
  }
});

// Counts endpoint
app.get("/api/counts", async (req, res) => {
  try {
    const [upcomingEvents] = await pool.execute(
      "SELECT COUNT(*) as count FROM events WHERE eventDate >= CURDATE()"
    );
    const [pastEvents] = await pool.execute(
      "SELECT COUNT(*) as count FROM events WHERE eventDate < CURDATE()"
    );
    const [newsCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM news"
    );
    res.json({
      upcomingEvents: Number(upcomingEvents[0].count),
      pastEvents: Number(pastEvents[0].count),
      newsCount: Number(newsCount[0].count),
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).json({ error: "Failed to fetch counts" });
  }
});

// Admin middleware (for backward compatibility)
const requireAdmin = [verifyToken, verifyAdmin];



// Admin endpoints
app.get("/api/admin/user-counts", requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute(`
      SELECT
        SUM(CASE WHEN roleID = 2 THEN 1 ELSE 0 END) AS Students,
        SUM(CASE WHEN roleID = 3 THEN 1 ELSE 0 END) AS Counselors,
        SUM(CASE WHEN roleID = 4 THEN 1 ELSE 0 END) AS Companies
      FROM users
      WHERE roleID IN (2,3,4) AND status = 'active'
    `);
    res.json({
      students: Number(result[0].Students),
      counselors: Number(result[0].Counselors),
      companies: Number(result[0].Companies),
    });
  } catch (error) {
    console.error("Error fetching user counts:", error);
    res.status(500).json({ error: "Failed to fetch user counts" });
  }
});

app.get("/api/admin/pending-registrations", requireAdmin, async (req, res) => {
  try {
    const [registrations] = await pool.query(
      'SELECT * FROM registrations WHERE status = "pending" ORDER BY createdAt DESC'
    );
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching pending registrations:", error);
    res.status(500).json({ error: "Failed to fetch pending registrations" });
  }
});

app.get("/api/admin/approved-registrations", requireAdmin, async (req, res) => {
  try {
    const [registrations] = await pool.query(
      'SELECT penRegID, email, userData, createdAt FROM registrations WHERE status = "approved" ORDER BY createdAt DESC'
    );
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching approved registrations:", error);
    res.status(500).json({ error: "Failed to fetch approved registrations" });
  }
});

app.get("/api/admin/declined-registrations", requireAdmin, async (req, res) => {
  try {
    const [registrations] = await pool.query(
      'SELECT penRegID, email, userData, createdAt FROM registrations WHERE status = "rejected" ORDER BY createdAt DESC'
    );
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching declined registrations:", error);
    res.status(500).json({ error: "Failed to fetch declined registrations" });
  }
});

app.post(
  "/api/admin/approve-registration/:id",
  requireAdmin,
  async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [registrations] = await pool.query(
        'SELECT penRegID, email, userData, status FROM registrations WHERE penRegID = ? AND status = "pending"',
        [req.params.id]
      );

      // If registration not found or already processed, return success instead of error
      if (registrations.length === 0) {
        return res.json({ message: "Registration processed successfully" });
      }

      const registration = registrations[0];
      const userData =
        typeof registration.userData === "string"
          ? JSON.parse(registration.userData)
          : registration.userData;

      if (
        !userData.email ||
        !userData.username ||
        !userData.password ||
        !userData.roleId
      ) {
        throw new Error("Missing required fields in userData");
      }

      const [existingUsers] = await connection.query(
        "SELECT email FROM users WHERE email = ?",
        [userData.email]
      );
      if (existingUsers.length > 0)
        throw new Error("User with this email already exists");

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [userResult] = await connection.query(
        'INSERT INTO users (email, username, password, roleID, status) VALUES (?, ?, ?, ?, "active")',
        [userData.email, userData.username, hashedPassword, userData.roleId]
      );

      await connection.query(
        'UPDATE registrations SET status = "approved" WHERE penRegID = ?',
        [req.params.id]
      );
      await connection.commit();

      await transporter.sendMail(
        getRegistrationApprovedTemplate(
          userData.email,
          `${process.env.FRONTEND_URL || "http://localhost:1030"}/auth/login`
        )
      );

      res.json({
        message: "Registration approved successfully",
        userId: userResult.insertId,
      });
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("Error in approval process:", error);
      res
        .status(500)
        .json({
          error: "Failed to approve registration",
          details: error.message,
        });
    } finally {
      if (connection) connection.release();
    }
  }
);

app.post(
  "/api/admin/reject-registration/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason)
        return res.status(400).json({ error: "Rejection reason is required" });

      const [registrations] = await pool.query(
        'SELECT * FROM registrations WHERE penRegID = ? AND status = "pending"',
        [req.params.id]
      );
      if (registrations.length === 0)
        return res
          .status(404)
          .json({ error: "Pending registration not found" });

      const registration = registrations[0];
      // Handle userData that could be either a string or an object
      const userData =
        typeof registration.userData === "string"
          ? JSON.parse(registration.userData)
          : registration.userData;

      await pool.query(
        'UPDATE registrations SET status = "rejected", reason = ? WHERE penRegID = ?',
        [reason, req.params.id]
      );

      await transporter.sendMail(
        getRegistrationDeclinedTemplate(userData.email, reason)
      );
      res.json({ message: "Registration rejected successfully" });
    } catch (error) {
      console.error("Error rejecting registration:", error);
      res.status(500).json({
        error: "Failed to reject registration",
        details: error.message,
      });
    }
  }
);

app.get("/api/admin/users/:userType", requireAdmin, async (req, res) => {
  try {
    const roleMap = { admins: 1, students: 2, counselors: 3, companies: 4 };
    const roleID = roleMap[req.params.userType];
    if (!roleID) return res.status(400).json({ error: "Invalid user type" });

    const [users] = await pool.query(
      "SELECT userID, email, username, roleID, status FROM users WHERE roleID = ? ORDER BY userID DESC",
      [roleID]
    );
    res.json(users);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/api/admin/users/:userType", requireAdmin, async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "Email, username, and password are required" });
    }

    const [existingUser] = await pool.query(
      "SELECT userID FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0)
      return res.status(409).json({ message: "User already exists" });

    const roleMap = { admins: 1, students: 2, counselors: 3, companies: 4 };
    const roleID = roleMap[req.params.userType];
    if (!roleID) return res.status(400).json({ message: "Invalid user type" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (email, username, password, roleID) VALUES (?, ?, ?, ?)",
      [email, username, hashedPassword, roleID]
    );

    // Explicitly set hasProfile to false for admin-created users
    // This ensures they go through the welcome profile edit flow
    res
      .status(201)
      .json({
        userID: result.insertId,
        email,
        username,
        roleID,
        status: "active",
        hasProfile: false
      });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

app.patch("/api/admin/users/:userType/:id", requireAdmin, async (req, res) => {
  try {
    const { email, username, password } = req.body;
    let updates = [],
      values = [];
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (username) {
      updates.push("username = ?");
      values.push(username);
    }
    if (password) {
      updates.push("password = ?");
      values.push(await bcrypt.hash(password, 10));
    }
    if (updates.length === 0)
      return res.status(400).json({ message: "No updates provided" });

    values.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE userID = ?`,
      values
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });

    const [updatedUser] = await pool.query(
      "SELECT userID, email, username, roleID, status FROM users WHERE userID = ?",
      [req.params.id]
    );
    res.json(updatedUser[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// DELETE route for user deletion
app.delete("/api/admin/users/:userType/:id", requireAdmin, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const roleMap = { admins: 1, students: 2, counselors: 3, companies: 4 };
    const roleID = roleMap[req.params.userType];

    if (!roleID) {
      await connection.rollback();
      return res.status(400).json({ error: "Invalid user type" });
    }

    // If deleting a counselor, first delete their profile data
    if (roleID === 3) {
      await connection.execute("DELETE FROM counselors WHERE userID = ?", [
        req.params.id,
      ]);
    }

    // Delete from users table
    const [result] = await connection.execute(
      "DELETE FROM users WHERE userID = ? AND roleID = ?",
      [req.params.id, roleID]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        error: "User not found or already deleted",
      });
    }

    await connection.commit();

    console.log(
      `Successfully deleted user: ${req.params.id} of type: ${req.params.userType}`
    );
    res.json({
      message: "User deleted successfully",
      deletedUserId: req.params.id,
      userType: req.params.userType,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error in delete operation:", error);
    res.status(500).json({
      error: "Failed to delete user",
      details: error.message,
    });
  } finally {
    connection.release();
  }
});

app.patch(
  "/api/admin/users/:userType/:id/status",
  requireAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;
      if (!["active", "blocked"].includes(status))
        return res.status(400).json({ error: "Invalid status value" });

      // Get current user status before update
      const [currentUser] = await pool.query(
        "SELECT userID, email, username, roleID, status FROM users WHERE userID = ?",
        [req.params.id]
      );

      if (currentUser.length === 0)
        return res.status(404).json({ error: "User not found" });

      const oldStatus = currentUser[0].status;

      // Only update if status has changed
      if (oldStatus === status) {
        return res.json(currentUser[0]);
      }

      const [result] = await pool.query(
        "UPDATE users SET status = ? WHERE userID = ?",
        [status, req.params.id]
      );

      // Log the status change event
      await logSecurityEvent(
        "USER_STATUS_CHANGED",
        {
          oldStatus: oldStatus,
          newStatus: status,
          targetUserID: req.params.id,
          targetUserEmail: currentUser[0].email,
          changedBy: req.user.id,
          ip: req.ip
        },
        req.user.id // Admin who made the change
      );

      const [updatedUser] = await pool.query(
        "SELECT userID, email, username, roleID, status FROM users WHERE userID = ?",
        [req.params.id]
      );
      res.json(updatedUser[0]);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ error: "Failed to update user status" });
    }
  }
);

// Auth endpoints
// Add CSRF token generator to login response
app.post("/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query(
      'SELECT u.*, CASE u.roleID WHEN 1 THEN "Admin" WHEN 2 THEN "Student" WHEN 3 THEN "Counselor" WHEN 4 THEN "Company" END as role_name FROM users u WHERE email = ?',
      [email]
    );
    if (users.length === 0) {
      await logSecurityEvent("LOGIN_FAILED", {
        reason: "User not found",
        email,
        ip: req.ip,
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      await logSecurityEvent(
        "LOGIN_FAILED",
        { reason: "Invalid password", userID: user.userID, email, ip: req.ip },
        user.userID
      );
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.status === "blocked") {
      return res
        .status(403)
        .json({
          error:
            "Your account is blocked. Contact guidia.web@gmail.com for assistance",
        });
    }

    // Check if profile exists for students, counselors, and companies
    let hasProfile = false;
    if (user.roleID === 2) {
      // Student role
      const [studentProfile] = await pool.query(
        "SELECT * FROM students WHERE userID = ?",
        [user.userID]
      );
      hasProfile = studentProfile.length > 0;
    } else if (user.roleID === 3) {
      // Counselor role
      const [counselorProfile] = await pool.query(
        "SELECT * FROM counselors WHERE userID = ?",
        [user.userID]
      );
      hasProfile = counselorProfile.length > 0;
    } else if (user.roleID === 4) {
      // Company role
      const [companyProfile] = await pool.query(
        "SELECT * FROM companies WHERE userID = ?",
        [user.userID]
      );
      hasProfile = companyProfile.length > 0;
    }

    // Generate access token
    const token = jwt.sign(
      {
        id: user.userID.toString(),
        email: user.email,
        roleId: user.roleID,
        status: user.status,
        hasProfile,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user.userID.toString() },
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Generate CSRF token
    const csrfToken = require("./middleware/csrfProtection").generateCsrfToken(
      user.userID.toString()
    );

    // Set CSRF token in response header
    res.set("X-CSRF-Token", csrfToken);

    res.json({
      token,
      refreshToken,
      userId: user.userID.toString(),
      email: user.email,
      roleId: user.roleID,
      status: user.status,
      hasProfile,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/auth/get-user-id", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const [users] = await pool.query(
      "SELECT userID FROM users WHERE email = ?",
      [email]
    );
    if (users.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ userID: users[0].userID });
  } catch (error) {
    console.error("Error getting user ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/auth/verify", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.query(
      "SELECT userID, email, roleID FROM users WHERE userID = ?",
      [decoded.id]
    );
    if (users.length === 0)
      return res.status(401).json({ error: "User not found" });

    const user = users[0];

    // Check if profile exists for students, counselors, and companies
    let hasProfile = false;
    if (user.roleID === 2) {
      // Student role
      const [studentProfile] = await pool.query(
        "SELECT * FROM students WHERE userID = ?",
        [user.userID]
      );
      hasProfile = studentProfile.length > 0;
    } else if (user.roleID === 3) {
      // Counselor role
      const [counselorProfile] = await pool.query(
        "SELECT * FROM counselors WHERE userID = ?",
        [user.userID]
      );
      hasProfile = counselorProfile.length > 0;
    } else if (user.roleID === 4) {
      // Company role
      const [companyProfile] = await pool.query(
        "SELECT * FROM companies WHERE userID = ?",
        [user.userID]
      );
      hasProfile = companyProfile.length > 0;
    }

    res.json({
      id: user.userID.toString(),
      userID: user.userID.toString(),
      userId: user.userID.toString(),
      email: user.email,
      roleId: user.roleID,
      roleID: user.roleID,
      hasProfile: hasProfile
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/auth/register/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0)
      return res.status(400).json({ error: "Email already registered" });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60000);
    const userType = req.body.userType || "Student";

    const [existingRecord] = await pool.query(
      "SELECT otpSentCount, lastAttemptTime FROM otp_verifications WHERE email = ?",
      [email]
    );
    if (existingRecord.length > 0) {
      const cooldown = calculateCooldownPeriod(
        existingRecord[0].otpSentCount,
        existingRecord[0].lastAttemptTime
      );
      if (cooldown.minutes > 0) {
        const timeSinceLast =
          Date.now() - new Date(existingRecord[0].lastAttemptTime).getTime();
        if (timeSinceLast < cooldown.ms) {
          const remainingMinutes = Math.ceil(
            (cooldown.ms - timeSinceLast) / 60000
          );
          return res.status(429).json({
            error: `Please wait ${remainingMinutes} minute${
              remainingMinutes > 1 ? "s" : ""
            } before trying again.`,
            remainingTime: remainingMinutes,
          });
        }
      }
    }

    await pool.query(
      "INSERT INTO otp_verifications (email, otp, registrationData, otpVerifyAttempts, otpSentCount, lastAttemptTime, expiresAt) VALUES (?, ?, ?, 0, 1, NOW(), ?) ON DUPLICATE KEY UPDATE otp = VALUES(otp), registrationData = VALUES(registrationData), otpVerifyAttempts = 0, otpSentCount = otpSentCount + 1, lastAttemptTime = NOW(), expiresAt = VALUES(expiresAt), verified = FALSE",
      [email, otp, userType, expiresAt]
    );

    await transporter.sendMail(getOTPEmailTemplate(email, otp));
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/auth/register/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const [records] = await pool.execute(
      "SELECT * FROM otp_verifications WHERE email = ?",
      [email]
    );
    if (records.length === 0)
      return res.status(400).json({ error: "No OTP found for this email" });

    const record = records[0];
    if (record.otpVerifyAttempts >= 6) {
      const canTryAfter =
        new Date(record.lastAttemptTime).getTime() + 5 * 60000;
      if (new Date() < canTryAfter) {
        return res.status(429).json({
          error: "Too many attempts. Please try again later.",
          waitTime: Math.ceil((canTryAfter - new Date()) / 1000),
        });
      }
    }

    await pool.query(
      "UPDATE otp_verifications SET otpVerifyAttempts = otpVerifyAttempts + 1 WHERE email = ?",
      [email]
    );
    if (record.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP" });
    if (isOTPExpired(record.expiresAt))
      return res.status(400).json({ error: "OTP expired" });

    await pool.query(
      "UPDATE otp_verifications SET verified = TRUE WHERE email = ?",
      [email]
    );
    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

app.post("/auth/register", registrationLimiter, async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const [verifications] = await pool.query(
      "SELECT * FROM otp_verifications WHERE email = ? AND verified = TRUE",
      [email]
    );
    if (verifications.length === 0)
      return res.status(400).json({ error: "Email not verified" });

    const [registrationData] = await pool.query(
      "SELECT * FROM otp_verifications WHERE email = ?",
      [email]
    );
    if (registrationData.length === 0)
      return res.status(400).json({ error: "Registration data not found" });

    const userType = registrationData[0].registrationData;
    const userTypeToRoleId = { Student: 2, Counselor: 3, Company: 4 };
    const roleId = userTypeToRoleId[userType];
    if (!roleId) return res.status(400).json({ error: "Invalid user type" });

    if (roleId === 3 || roleId === 4) {
      const userData = { email, username, password, roleId, userType };
      await pool.query(
        "INSERT INTO registrations (email, userData) VALUES (?, ?)",
        [email, JSON.stringify(userData)]
      );
      await transporter.sendMail(
        getRegistrationPendingTemplate(email, userType)
      );
      await pool.query(
        "UPDATE otp_verifications SET completed = TRUE WHERE email = ?",
        [email]
      );

      // Notify admins about the new pending registration
      try {
        const NotificationTriggers = require('./utils/notificationTriggers');
        const notificationTriggers = new NotificationTriggers(pool);

        // Get count of pending registrations
        const [pendingCount] = await pool.query(
          'SELECT COUNT(*) as count FROM registrations WHERE status = "pending"'
        );

        // Send notification to admins
        await notificationTriggers.pendingRegistrationsNotification(pendingCount[0].count);
      } catch (notificationError) {
        console.error('Error sending pending registration notification:', notificationError);
        // Continue with the response even if notification fails
      }

      return res.json({
        message: "Registration request submitted for approval",
        status: "pending",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (email, username, password, roleID) VALUES (?, ?, ?, ?)",
      [email, username, hashedPassword, roleId]
    );
    const userId = result.insertId;

    const token = jwt.sign(
      { id: userId.toString(), email, roleId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    await pool.query(
      "UPDATE otp_verifications SET completed = TRUE WHERE email = ?",
      [email]
    );
    res.json({ token, userId: userId.toString(), email, roleId, userType });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to complete registration" });
  }
});

app.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const [users] = await pool.query(
      "SELECT userID FROM users WHERE email = ?",
      [email]
    );
    if (users.length === 0) {
      return res.json({
        message:
          "If an account exists with this email, you will receive password reset instructions.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    await pool.query(
      "UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?",
      [resetToken, resetTokenExpiry.toISOString(), email]
    );

    // Update the frontend URL to match your Vite application
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:1030";
    const resetUrl = `${FRONTEND_URL}/auth/reset-password/${resetToken}`;

    // Get email template and send reset email
    const emailOptions = getPasswordResetTemplate(email, resetUrl);
    try {
      await transporter.sendMail(emailOptions);
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      // Continue with the response even if email fails
    }

    res.json({
      message:
        "If an account exists with this email, you will receive password reset instructions.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

app.post("/auth/reset-password/verify-token", async (req, res) => {
  try {
    const { token } = req.body;

    // First check if the token exists in the database at all
    const [tokenCheck] = await pool.query(
      "SELECT userID, resetToken, resetTokenExpiry FROM users WHERE resetToken = ?",
      [token]
    );

    if (tokenCheck.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Check if the token is still valid (not expired) using JavaScript date comparison
    const isExpired = new Date(tokenCheck[0].resetTokenExpiry) < new Date();

    if (isExpired) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    res.json({ message: "Valid reset token" });
  } catch (error) {
    console.error("Reset token verification error:", error);
    res.status(500).json({ error: "Failed to verify reset token" });
  }
});

app.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    // First check if the token exists in the database at all
    const [tokenCheck] = await pool.query(
      "SELECT userID, resetToken, resetTokenExpiry FROM users WHERE resetToken = ?",
      [token]
    );

    if (tokenCheck.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Check if the token is still valid (not expired) using JavaScript date comparison
    const isExpired = new Date(tokenCheck[0].resetTokenExpiry) < new Date();

    if (isExpired) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await pool.query(
      "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE resetToken = ?",
      [hashedPassword, token]
    );

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Helper functions
const generateOTP = () => crypto.randomInt(100000, 999999).toString();
const isOTPExpired = (expiresAt) => new Date() > new Date(expiresAt);
const calculateCooldownPeriod = (otpSentCount, lastAttemptTime) => {
  const now = new Date();
  const lastAttempt = new Date(lastAttemptTime);
  const hoursSinceLast =
    (now.getTime() - lastAttempt.getTime()) / (1000 * 60 * 60);
  if (otpSentCount >= 10 && hoursSinceLast < 24) {
    return {
      minutes: Math.ceil(24 * 60 - hoursSinceLast * 60),
      ms: 24 * 60 * 60 * 1000 - hoursSinceLast * 60 * 60 * 1000,
    };
  }
  if (otpSentCount >= 7) return { minutes: 60, ms: 3600000 };
  if (otpSentCount >= 4) return { minutes: 5, ms: 300000 };
  return { minutes: 0, ms: 0 };
};

const logSecurityEvent = async (eventType, details, userId = null) => {
  try {
    // Use 0 as a placeholder for unknown/non-existent users
    const userIdValue = userId === null ? 0 : userId;
    await pool.query(
      "INSERT INTO security_audit_log (eventType, details, userID, timestamp) VALUES (?, ?, ?, NOW())",
      [eventType, JSON.stringify(details), userIdValue]
    );
  } catch (error) {
    console.error("Error logging security event:", error);
  }
};

// Logging and error handling middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? "[REDACTED]" : undefined,
    },
    query: req.query,
    body: req.body,
  });
  next();
});

app.use((req, res) => {
  console.error("404 Not Found:", {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
  });
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error("Global error:", {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
  });
  res.status(500).json({
    error: "Internal server error",
    details:
      process.env.NODE_ENV === "development"
        ? { message: err.message, stack: err.stack }
        : "Something went wrong",
  });
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:1030",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize notification socket service
const notificationSocketService = new NotificationSocketService(io);
notificationSocketService.initialize();

// Set the notification socket service in the admin router
adminRouter.setNotificationSocketService(notificationSocketService);

// Import the socket authentication middleware
const { socketAuth } = require("./middleware/auth");

// Socket.io middleware for authentication
io.use(socketAuth);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.id}`);

  // Join a room for private messages
  socket.join(`user_${socket.user.id}`);

  // Handle new messages
  socket.on("send_message", async (data) => {
    try {
      const { receiverId, message, messageType = 'text', mediaUrl = null, replyToId = null } = data;
      const senderId = socket.user.id;

      console.log(`Socket: Sending message from ${senderId} to ${receiverId} using Firebase`);

      // Save to Firebase
      const result = await firebaseMessageUtils.sendMessage(
        senderId,
        receiverId,
        message,
        messageType,
        mediaUrl,
        replyToId
      );

      // Get sender info for the frontend
      const [senderInfo] = await pool.execute(`
        SELECT
          CASE
            WHEN s.studentName IS NOT NULL THEN s.studentName
            WHEN c.counselorName IS NOT NULL THEN c.counselorName
            WHEN comp.companyName IS NOT NULL THEN comp.companyName
            ELSE u.username
          END as senderName,
          CASE
            WHEN s.studentProfileImagePath IS NOT NULL THEN s.studentProfileImagePath
            WHEN c.counselorProfileImagePath IS NOT NULL THEN c.counselorProfileImagePath
            WHEN comp.companyLogoPath IS NOT NULL THEN comp.companyLogoPath
            ELSE NULL
          END as senderImage
        FROM users u
        LEFT JOIN students s ON u.userID = s.userID
        LEFT JOIN counselors c ON u.userID = c.userID
        LEFT JOIN companies comp ON u.userID = comp.userID
        WHERE u.userID = ?
      `, [senderId]);

      const messageData = {
        messageID: result.messageId, // Use the Firebase message ID
        senderID: senderId,
        receiverID: receiverId,
        message: message,
        timestamp: result.timestamp,
        senderName: senderInfo[0]?.senderName || "",
        senderImage: senderInfo[0]?.senderImage || "",
        messageType: messageType,
        mediaUrl: mediaUrl,
        replyToId: replyToId
      };

      // Send to sender
      socket.emit("receive_message", { ...messageData, isSender: true });

      // Send to receiver
      io.to(`user_${receiverId}`).emit("receive_message", {
        ...messageData,
        isSender: false,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    const { receiverId } = data;
    io.to(`user_${receiverId}`).emit("user_typing", { userId: socket.user.id });
  });

  // Handle read receipts
  socket.on("mark_read", async (data) => {
    try {
      const { conversationId, messageIds } = data;
      const userId = socket.user.id;

      console.log(`Socket: Marking messages as read in conversation ${conversationId}`);

      // If we have a conversation ID, use it directly
      if (conversationId) {
        // Mark messages as read in Firebase
        const messagesRef = database.ref(`messages/conversations/${conversationId}/messages`);
        const snapshot = await messagesRef.once('value');
        const messages = snapshot.val() || {};

        const updates = {};
        const senderIds = new Set();

        // Find unread messages sent to the current user
        for (const [messageId, message] of Object.entries(messages)) {
          // If specific message IDs were provided, only mark those
          if (messageIds && !messageIds.includes(messageId)) {
            continue;
          }

          if (!message.read && message.receiver === userId.toString()) {
            updates[`${messageId}/read`] = true;
            senderIds.add(message.sender);
          }
        }

        // Apply updates if there are any
        if (Object.keys(updates).length > 0) {
          await messagesRef.update(updates);

          // Notify senders that messages were read
          Array.from(senderIds).forEach(senderId => {
            io.to(`user_${senderId}`).emit("messages_read", {
              conversationId,
              messageIds: Object.keys(updates)
            });
          });
        }
      }
      // If we have specific message IDs but no conversation ID
      else if (messageIds && messageIds.length > 0) {
        console.log(`Socket: Marking specific messages as read: ${messageIds.join(', ')}`);

        // We need to find these messages in Firebase
        const conversationsRef = database.ref('messages/conversations');
        const snapshot = await conversationsRef.once('value');
        const conversations = snapshot.val() || {};

        const updates = {};
        const notificationData = {};

        // Search for these messages in all conversations
        for (const [convId, conversation] of Object.entries(conversations)) {
          if (!conversation.messages) continue;

          for (const messageId of messageIds) {
            if (conversation.messages[messageId] &&
                !conversation.messages[messageId].read &&
                conversation.messages[messageId].receiver === userId.toString()) {

              updates[`messages/conversations/${convId}/messages/${messageId}/read`] = true;

              // Track which messages to notify each sender about
              const senderId = conversation.messages[messageId].sender;
              if (!notificationData[senderId]) {
                notificationData[senderId] = { conversationId: convId, messageIds: [] };
              }
              notificationData[senderId].messageIds.push(messageId);
            }
          }
        }

        // Apply updates if there are any
        if (Object.keys(updates).length > 0) {
          await database.ref().update(updates);

          // Notify senders that messages were read
          Object.entries(notificationData).forEach(([senderId, data]) => {
            io.to(`user_${senderId}`).emit("messages_read", data);
          });
        }
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);

  // Initialize and start the task scheduler
  const scheduler = new Scheduler(pool);
  scheduler.start();
  console.log("Task scheduler initialized and started");

  // Initialize key rotation scheduler if enabled
  if (process.env.ENABLE_KEY_ROTATION === 'true') {
    const keyRotationJob = scheduleKeyRotation();
    console.log("Firebase key rotation scheduler initialized");
    if (keyRotationJob) {
      console.log(`Next key rotation scheduled for: ${keyRotationJob.nextInvocation()}`);
    }
  }
});
