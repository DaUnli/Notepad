require("dotenv").config();
const config = require("./config.json");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

const User = require("./models/user.model");
const Note = require("./models/note.model");

mongoose.connect(config.connectionString);

const app = express();

// === MIDDLEWARES ===
app.use(express.json());
app.use(cookieParser()); // required for reading cookies

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://notepad-frontend-h386.onrender.com",
    ],
    credentials: true, // allow cookies
  })
);

// helper functions
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

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

// ========== REGISTER ==========
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: true, message: "All fields required" });
  }

  const isUser = await User.findOne({ email });
  if (isUser)
    return res.json({ error: true, message: "User already exists" });

  const user = new User({ fullName, email, password });
  await user.save();

  // generate tokens
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  // send tokens in HttpOnly cookies
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
});

// ========== LOGIN ==========
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email });
  if (!user || user.password !== password)
    return res.status(400).json({ error: true, message: "Invalid credentials" });

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
});

// ========== TOKEN REFRESH ==========
app.post("/refresh", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
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
    console.error(err);
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
});

// ========== NOTES ==========
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  if (!title || !content)
    return res.status(400).json({ error: true, message: "Title & content required" });

  const note = new Note({ title, content, tags: tags || [], userId: req.user._id });
  await note.save();
  res.json({ error: false, note, message: "Note added successfully" });
});

// edit-note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const user = req.user;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(403).json({ error: true, message: "Forbidden" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// get-all-notes
app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const user = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });

    return res.json({
      error: false,
      notes,
      message: "All note retrived successfully",
    });
  } catch (error) {
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
    return res
      .status(500)
      .json({ error: true, message: "Internal Server error" });
  }
});

// update isPinned Value
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const user = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(403).json({ error: true, message: "Note not found" });
    }

    note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
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
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});


app.listen(8000);

module.exports = app;
