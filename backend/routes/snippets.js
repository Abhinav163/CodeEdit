const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Snippet = require("../models/Snippet");
const User = require("../models/User"); // Ensure this import is present

// @route   POST /api/snippets
// @desc    Save a new code snippet
router.post("/", auth, async (req, res) => {
  const { title, language, code } = req.body;
  try {
    const newSnippet = new Snippet({
      title,
      language,
      code,
      user: req.user.id,
    });
    const snippet = await newSnippet.save();
    res.json(snippet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/snippets/user
// @desc    Get all snippets created by the logged-in user
router.get("/user", auth, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(snippets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/snippets/shared
// @desc    Get all snippets shared with the logged-in user
router.get("/shared", auth, async (req, res) => {
  try {
    const snippets = await Snippet.find({ sharedWith: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(snippets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/snippets/:id
// @desc    Get a single snippet by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ msg: "Snippet not found" });
    }

    const isOwner = snippet.user.toString() === req.user.id;
    const isShared = snippet.sharedWith.some((id) => id.equals(req.user.id));

    if (!snippet.isPublic && !isOwner && !isShared) {
      return res
        .status(401)
        .json({ msg: "Not authorized to view this snippet" });
    }

    res.json(snippet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT /api/snippets/:id
// @desc    Update a code snippet
router.put("/:id", auth, async (req, res) => {
  const { code } = req.body;
  try {
    let snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ msg: "Snippet not found" });
    }

    // Prevent edits if the snippet is read-only
    if (snippet.readOnly) {
      return res.status(403).json({ msg: "This snippet is read-only." });
    }

    const isOwner = snippet.user.toString() === req.user.id;
    const isShared = snippet.sharedWith.some((id) => id.equals(req.user.id));

    if (!isOwner && !isShared) {
      return res
        .status(401)
        .json({ msg: "Not authorized to update this snippet" });
    }

    snippet.code = code;
    await snippet.save();

    res.json(snippet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PATCH /api/snippets/:id/share
// @desc    Make a snippet public and add collaborators
router.patch("/:id/share", auth, async (req, res) => {
  const { emails, readOnly } = req.body;

  try {
    let snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ msg: "Snippet not found" });
    }

    if (snippet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    if (emails && emails.length > 0) {
      const users = await User.find({ email: { $in: emails } });
      const userIds = users.map((user) => user._id);

      userIds.forEach((userId) => {
        const alreadyExists = snippet.sharedWith.some((id) =>
          id.equals(userId)
        );
        if (!alreadyExists) {
          snippet.sharedWith.push(userId);
        }
      });
    }

    snippet.isPublic = true;
    snippet.readOnly = !!readOnly; // Set read-only status
    await snippet.save();

    res.json({ msg: "Snippet is now public and shareable", snippet });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE /api/snippets/:id
// @desc    Delete a code snippet
router.delete("/:id", auth, async (req, res) => {
  try {
    let snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ msg: "Snippet not found" });
    }

    if (snippet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await Snippet.findByIdAndDelete(req.params.id);

    res.json({ msg: "Snippet removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
