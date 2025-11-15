const mongoose = require("mongoose");

// Sub-schema for individual files within a project
const FileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
    trim: true,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    default: "",
  },
});

const ProjectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  // 'web' for multi-file web projects, 'code' for single-file snippets
  projectType: {
    type: String,
    enum: ["web", "code"],
    required: true,
    default: "code",
  },
  // Replaced 'code' and 'language' with 'files' array
  files: [FileSchema],
  isPublic: {
    type: Boolean,
    default: false,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  sharedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  chat: [
    {
      sender: String,
      text: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Project", ProjectSchema);
