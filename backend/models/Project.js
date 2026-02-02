const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
    trim: true,
  },
  path: {
    type: String,
    default: "/",
    trim: true,
  },
  isFolder: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    required: function () {
      return !this.isFolder;
    },
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
  projectType: {
    type: String,
    enum: ["web", "code"],
    required: true,
    default: "code",
  },
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
