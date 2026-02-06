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

app.use(
  cors({
    origin: ["http://localhost:5173", "https://notepad-24hm.onrender.com"],
    credentials: true,
  }),
);

/* ===== DATABASE ===== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

/* ===== AUTH ===== */

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

  res.cookie("accessToken", token, {
    httpOnly: true,
    sameSite: "none",
    secure: false,
    maxAge: 3600000,
  });

  res.json({ message: "Account created" });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("accessToken", token, {
    httpOnly: true,
    sameSite: "none",
    secure: false,
    maxAge: 3600000,
  });

  res.json({ message: "Login successful" });
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.json({ message: "Logged out" });
});

// Get user
app.get("/get-user", authenticateToken, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.json({
    user,
  });
});

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
    const notes = await Note.find({ userId: req.user._id })
      .sort({
        isPinned: -1,    // 📌 pinned notes first
        updatedAt: -1,   // newest on top inside each group
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
