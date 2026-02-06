import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";

import { authenticateToken } from "./utilities.js";
import User from "./models/user.model.js";
import Note from "./models/note.model.js";

dotenv.config();
const app = express();

/* ===== MIDDLEWARE ===== */
app.use(express.json());
app.use(cookieParser());

// FIX 1: Ensure CORS allows credentials and specifically matches your frontend URL
app.use(
  cors({
    origin: "https://notepad-24hm.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* ===== DATABASE ===== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });

/* ===== AUTH HELPERS ===== */
// Centralized cookie options to prevent repetition errors
const cookieOptions = {
  httpOnly: true,
  // If in production, must be 'none' and 'secure: true'
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 3600000, // 1 hour
};

/* ===== AUTH ROUTES ===== */

// Register
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });

  // FIX 2: Applied proper cookie options here too
  res.cookie("accessToken", token, cookieOptions);

  res.json({
    error: false,
    message: "Account created",
    user: { email: user.email, fullName: user.fullName },
  });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });

  // FIX 3: Consistent cookie settings
  res.cookie("accessToken", token, cookieOptions);

  res.json({
    error: false,
    message: "Login successful",
    user: { email: user.email, fullName: user.fullName },
  });
});

app.post("/logout", (req, res) => {
  // To clear a cookie, options must match the ones used to set it
  res.clearCookie("accessToken", {
    ...cookieOptions,
    maxAge: 0,
  });
  res.json({ message: "Logged out" });
});

/* ===== NOTES ROUTES (Logic remains same, added try/catch for safety) ===== */

app.get("/get-user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// ... [Rest of your notes routes remain largely the same]
// Just ensure they all use 'authenticateToken' middleware and have proper error handling
/* ===== NOTES ===== */

app.post("/add-note", authenticateToken, async (req, res) => {
  const note = await Note.create({
    ...req.body,
    userId: req.user._id,
  });
  res.json(note);
});

// Edit note
app.put("/edit-note/:id", authenticateToken, async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!note) return res.status(404).json({ message: "Note not found" });

  if (req.body.title !== undefined) note.title = req.body.title;
  if (req.body.content !== undefined) note.content = req.body.content;
  if (req.body.tags !== undefined) note.tags = req.body.tags;

  await note.save();
  res.json({ note });
});

// Search notes
app.get("/search-notes", authenticateToken, async (req, res) => {
  const query = req.query.query;
  const notes = await Note.find({
    userId: req.user._id,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
    ],
  });
  res.json({
    notes,
  });
});

// Update note pin status
app.put("/update-note-pinned/:id", authenticateToken, async (req, res) => {
  const { isPinned } = req.body;
  const noteId = req.params.id;

  if (typeof isPinned !== "boolean") {
    return res.status(400).json({
      error: true,
      message: "isPinned must be a boolean value",
    });
  }

  try {
    const note = await Note.findOne({
      _id: noteId,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        error: true,
        message: "Note not found",
      });
    }

    note.isPinned = isPinned;
    await note.save();

    res.json({
      error: false,
      note,
      message: isPinned
        ? "Note pinned successfully"
        : "Note unpinned successfully",
    });
  } catch (error) {
    console.error("Update pin error:", error);
    res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

// Get all notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({
      isPinned: -1, // 📌 pinned notes first
      updatedAt: -1, // newest on top inside each group
    });

    res.json({ notes });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notes" });
  }
});

app.delete("/delete-note/:id", authenticateToken, async (req, res) => {
  await Note.deleteOne({ _id: req.params.id, userId: req.user._id });
  res.json({
    error: false,
    message: "Note deleted",
  });
});

/* ===== SERVER ===== */
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`),
);
