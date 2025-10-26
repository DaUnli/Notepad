const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  isPinned: { type: Boolean, default: false },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: new Date().getTime() },
});

module.exports = mongoose.model("Note", noteSchema);
