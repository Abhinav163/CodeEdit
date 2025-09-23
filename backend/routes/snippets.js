const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Snippet = require("../models/Snippet");

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
// @desc    Get all snippets for the logged-in user
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

// @route   GET /api/snippets/:id
// @desc    Get a single public snippet by ID
router.get("/:id", async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet || !snippet.isPublic) {
      return res
        .status(404)
        .json({ msg: "Snippet not found or is not public" });
    }
    res.json(snippet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    let snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({ msg: "Snippet not found" });
    }

    // Make sure the user owns the snippet
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

// (Optional) Add PUT for updating and DELETE for deleting snippets here

module.exports = router;
