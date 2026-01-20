require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult, oneOf } = require("express-validator");
const { authenticateToken } = require("./utilities");
const Note = require("./models/note.model");
const User = require("./models/user.model");

const app = express();

// ===== BASIC MIDDLEWARE =====
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://notepad-frontend-h386.onrender.com",
    ],
  })
);

// ===== CONNECT DB =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

// ===== TEST ROUTE =====
app.get("/", (req, res) => {
  res.json({ message: "Server running ✅" });
});

// ===== REGISTER =====
app.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Account created successfully",
      user: { id: user._id, fullName, email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// get user
app.get("/get-user", authenticateToken, async (req, res) => {
  const user = req.user;

  try {
    const foundUser = await User.findById(req.user._id).select("-password");
    if (!foundUser)
      return res.status(401).json({ error: true, message: "User not found" });

    res.json({
      error: false,
      user: {
        fullName: foundUser.fullName,
        email: foundUser.email,
        _id: foundUser._id,
        createdOn: foundUser.createdOn,
      },
    });
  } catch (err) {
    console.error("❌ Get User Error:", err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

// add-note
app.post(
  "/add-note",
  authenticateToken,
  [
    body("title").notEmpty().withMessage("Title is required").trim().escape(),
    body("content")
      .notEmpty()
      .withMessage("Content is required")
      .trim()
      .escape(),
    body("tags").optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: true, message: errors.array()[0].msg });
    }

    try {
      const { title, content, tags } = req.body;
      const note = new Note({
        title,
        content,
        tags: tags || [],
        userId: req.user._id,
      });
      await note.save();

      res
        .status(201)
        .json({ error: false, note, message: "Note added successfully" });
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

      if (req.body.title !== undefined) note.title = title;
      if (req.body.content !== undefined) note.content = content;
      if (req.body.tags !== undefined) note.tags = tags;
      if (req.body.isPinned !== undefined) note.isPinned = isPinned;

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
        .json({ error: true, message: "Internal Server Error" });
    }
  }
);
// get all notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
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
    const result = await Note.deleteOne({ _id: noteId, userId: user._id });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Note not found or unauthorized" });
    }

    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Note Error:", error);
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
});

app.get("/search-notes/", authenticateToken, async (req, res) => {
  const user = req.user;
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({
      error: true,
      message: "Search query is required",
    });
  }

  try {
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

// ===== START SERVER =====
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
