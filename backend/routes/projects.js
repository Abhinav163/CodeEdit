const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Project = require("../models/Project"); // Renamed from Snippet
const User = require("../models/User");

// Create a new project (either 'web' or 'code')
router.post("/", auth, async (req, res) => {
  const { title, files, projectType } = req.body; // Expect title, files array, and type
  try {
    const newProject = new Project({
      title,
      files,
      projectType,
      user: req.user.id,
    });
    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get user's projects (both types)
router.get("/user", auth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get projects (both types) shared with user
router.get("/shared", auth, async (req, res) => {
  try {
    const projects = await Project.find({ sharedWith: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get a specific project by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const isOwner = project.user.toString() === req.user.id;
    const isShared = project.sharedWith.some((id) => id.equals(req.user.id));

    if (!project.isPublic && !isOwner && !isShared) {
      return res
        .status(401)
        .json({ msg: "Not authorized to view this project" });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update a specific file in a project
router.put("/:id/file", auth, async (req, res) => {
  const { fileName, newCode } = req.body;
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    if (project.readOnly) {
      return res.status(403).json({ msg: "This project is read-only." });
    }

    const isOwner = project.user.toString() === req.user.id;
    const isShared = project.sharedWith.some((id) => id.equals(req.user.id));

    if (!isOwner && !isShared) {
      return res
        .status(401)
        .json({ msg: "Not authorized to update this project" });
    }

    // Update the specific file's code
    await Project.updateOne(
      { _id: req.params.id, "files.fileName": fileName },
      { $set: { "files.$.code": newCode } }
    );

    // Find the file to send back in response (for socket sync)
    const updatedFile = project.files.find((f) => f.fileName === fileName);
    if (updatedFile) {
      updatedFile.code = newCode; // Manually update for the response
    }

    res.json({ fileName, newCode });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Share a project
router.patch("/:id/share", auth, async (req, res) => {
  const { emails, readOnly } = req.body;
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    if (emails && emails.length > 0) {
      const users = await User.find({ email: { $in: emails } });
      const userIds = users.map((user) => user._id);

      userIds.forEach((userId) => {
        const alreadyExists = project.sharedWith.some((id) =>
          id.equals(userId)
        );
        if (!alreadyExists) {
          project.sharedWith.push(userId);
        }
      });
    }

    project.isPublic = true;
    project.readOnly = !!readOnly;
    await project.save();

    res.json({ msg: "Project is now public and shareable", project });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete a project
router.delete("/:id", auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ msg: "Project removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
