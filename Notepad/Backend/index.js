require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const { body, validationResult, oneOf } = require("express-validator");
const { authenticateToken } = require("./utilities");

const User = require("./models/user.model");
const Note = require("./models/note.model");

const app = express();

// === SECURITY & BASIC MIDDLEWARE ===
app.use(express.json());
app.use(cookieParser());
app.use(helmet()); // 🛡️ Protects against XSS, CSP, etc.

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://notepad-frontend-h386.onrender.com",
    ],
    credentials: true,
  })
);

// === DATABASE CONNECTION ===
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// === TOKEN HELPERS ===
function createAccessToken(user) {
  return jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10m",
  });
}
function createRefreshToken(user) {
  return jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

app.get("/", (req, res) => res.json({ data: "Hello Server Running ✅" }));

// ========== REGISTER ==========
app.post(
  "/create-account",
  [
    body("fullName").trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).escape(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ error: true, message: errors.array() });

      const { fullName, email, password } = req.body;

      const isUser = await User.findOne({ email });
      if (isUser)
        return res
          .status(409)
          .json({ error: true, message: "User already exists" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({ fullName, email, password: hashedPassword });
      await user.save();

      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        maxAge: 10 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        error: false,
        message: "Registration successful",
        user: { id: user._id, fullName, email },
      });
    } catch (err) {
      console.error("❌ Create Account Error:", err);
      return res
        .status(500)
        .json({ error: true, message: "Internal Server Error" });
    }
  }
);

// ========== LOGIN ==========
app.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").trim().escape()],
  async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });

      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid credentials" });
      }
      if (!(await bcrypt.compare(password, user.password)))
        return res.status(400).json({
          error: true,
          message: "Invalid credentials",
        });

      const accessToken = createAccessToken(user);
      const refreshToken = createRefreshToken(user);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        maxAge: 10 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        error: false,
        message: "Login successful",
        user: { id: user._id, fullName: user.fullName, email: user.email },
      });
    } catch (err) {
      console.error("❌ Login Error:", err);
      return res
        .status(500)
        .json({ error: true, message: "Internal Server Error" });
    }
  }
);

// ========== TOKEN REFRESH ==========
app.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload._id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const newAccessToken = createAccessToken(user);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      maxAge: 10 * 60 * 1000,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("❌ Refresh Token Error:", err);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

// ========== LOGOUT ==========
app.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});

// ========== PROTECTED ROUTES ==========
app.get("/get-user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.sendStatus(401);
    res.json({
      user: {
        fullName: user.fullName,
        email: user.email,
        _id: user._id,
        createdOn: user.createdOn,
      },
    });
  } catch (err) {
    console.error("❌ Get User Error:", err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

// ========== ADD NOTE ==========
app.post(
  "/add-note",
  authenticateToken,
  [
    body("title").trim().escape(),
    body("content").trim().escape(),
    body("tags").optional().isArray(),
  ],
  async (req, res) => {
    try {
      const { title, content, tags } = req.body;
      if (!title || !content)
        return res
          .status(400)
          .json({ error: true, message: "Title & content required" });

      const note = new Note({
        title,
        content,
        tags: tags || [],
        userId: req.user._id,
      });
      await note.save();

      res.json({ error: false, note, message: "Note added successfully" });
    } catch (error) {
      console.error("❌ Add Note Error:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  }
);

// edit-note
app.put(
  "/edit-note/:noteId",
  authenticateToken,
  [
    // Ensure at least one field is being updated
    oneOf([
      body("title").exists(),
      body("content").exists(),
      body("tags").exists(),
      body("isPinned").exists(),
    ]),
    body("title").optional().trim().escape(),
    body("content").optional().trim().escape(),
    body("tags").optional().isArray(),
    body("isPinned").optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: true, message: "No changes provided or invalid data" });
    }

    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;

    try {
      const note = await Note.findOne({ _id: noteId, userId: req.user._id });

      if (!note) {
        return res.status(404).json({ error: true, message: "Note not found" });
      }

      if (title !== undefined) note.title = title;
      if (content !== undefined) note.content = content;
      if (tags !== undefined) note.tags = tags;
      if (isPinned !== undefined) note.isPinned = isPinned;

      await note.save();
      return res.json({
        error: false,
        note,
        message: "Note updated successfully",
      });
    } catch (error) {
      console.error("❌ Edit Note Error:", error);
      return res
        .status(500)
        .json({ error: true, message: "Internal Server error" });
    }
  }
);
// get all notes
app.get("/get-notes", authenticateToken, async (req, res) => {
  const user = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Get All Notes Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const user = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });

    return res.json({
      error: false,
      message: "Note deleted succesfully",
    });
  } catch (error) {
    console.error("❌ Delete Note Error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server error" });
  }
});

// search Value
app.get("/search-notes/", authenticateToken, async (req, res) => {
  const user = req.user;
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      error: true,
      message: "Search query is required",
    });
  }

  try {
    // Escape special characters to prevent ReDoS attacks
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(escapedQuery, "i") } },
        { content: { $regex: new RegExp(escapedQuery, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Search Notes Error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

app.listen(8000, () => console.log("✅ Server running on port 8000"));

// Global Error Handling
process.on("unhandledRejection", (reason) =>
  console.error("🔥 Unhandled Rejection:", reason)
);
process.on("uncaughtException", (err) =>
  console.error("🔥 Uncaught Exception:", err)
);

module.exports = app;
