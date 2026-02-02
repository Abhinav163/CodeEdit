const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Project = require("../models/Project");
const User = require("../models/User");

router.post("/", auth, async (req, res) => {
  const { title, files, projectType } = req.body;
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

    await Project.updateOne(
      { _id: req.params.id, "files.fileName": fileName },
      { $set: { "files.$.code": newCode } },
    );

    const updatedFile = project.files.find((f) => f.fileName === fileName);
    if (updatedFile) {
      updatedFile.code = newCode;
    }

    res.json({ fileName, newCode });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

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
          id.equals(userId),
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

// Add a new file or folder to a project
router.post("/:id/file", auth, async (req, res) => {
  const { fileName, path, language, isFolder } = req.body;
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const isOwner = project.user.toString() === req.user.id;
    const isShared = project.sharedWith.some((id) => id.equals(req.user.id));

    if (!isOwner && !isShared) {
      return res
        .status(401)
        .json({ msg: "Not authorized to modify this project" });
    }

    if (project.readOnly) {
      return res.status(403).json({ msg: "This project is read-only." });
    }

    // Check if file/folder already exists at this path
    const exists = project.files.some(
      (f) => f.fileName === fileName && f.path === path,
    );
    if (exists) {
      return res.status(400).json({ msg: "File or folder already exists" });
    }

    const newFile = {
      fileName,
      path: path || "/",
      isFolder: isFolder || false,
      language: isFolder ? undefined : language || "javascript",
      code: isFolder ? undefined : "",
    };

    project.files.push(newFile);
    await project.save();

    res.json({ msg: "File/folder added", file: newFile });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete a file or folder from a project
router.delete("/:id/file", auth, async (req, res) => {
  const { fileName, path } = req.body;
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: "Project not found" });
    }

    const isOwner = project.user.toString() === req.user.id;
    const isShared = project.sharedWith.some((id) => id.equals(req.user.id));

    if (!isOwner && !isShared) {
      return res
        .status(401)
        .json({ msg: "Not authorized to modify this project" });
    }

    if (project.readOnly) {
      return res.status(403).json({ msg: "This project is read-only." });
    }

    const fileIndex = project.files.findIndex(
      (f) => f.fileName === fileName && f.path === path,
    );

    if (fileIndex === -1) {
      return res.status(404).json({ msg: "File or folder not found" });
    }

    const fileToDelete = project.files[fileIndex];

    // If deleting a folder, also delete all files inside it
    if (fileToDelete.isFolder) {
      const folderPath = path === "/" ? `/${fileName}` : `${path}/${fileName}`;
      project.files = project.files.filter(
        (f) =>
          !f.path.startsWith(folderPath) ||
          (f.fileName === fileName && f.path === path),
      );
    }

    project.files.splice(fileIndex, 1);
    await project.save();

    res.json({ msg: "File/folder deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
