const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { spawn } = require("child_process"); // Change exec to spawn
require("dotenv").config();

// Middleware for authentication
const auth = require("./middleware/auth");

// Connect to Database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// --- API Routes ---
// Auth Routes (Login/Register)
app.use("/api/auth", require("./routes/auth"));
app.use("/api/snippets", require("./routes/snippets"));
// Code Execution Route (Protected)
// app.post("/run", auth, (req, res) => {
//   const { language = "javascript", code } = req.body;

//   if (code === undefined || code.trim() === "") {
//     return res.status(400).json({ error: "Code is empty." });
//   }

//   const tempDir = path.join(__dirname, "temp");
//   if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true });
//   }

//   let command;
//   let filePath;
//   let outPath;

//   if (language === "javascript") {
//     filePath = path.join(tempDir, "script.js");
//     fs.writeFileSync(filePath, code);
//     command = `node "${filePath}"`; // Fix for spaces
//   } else if (language === "python") {
//     filePath = path.join(tempDir, "script.py");
//     fs.writeFileSync(filePath, code);
//     command = `python "${filePath}"`; // Fix for spaces
//   } else if (language === "cpp") {
//     filePath = path.join(tempDir, "script.cpp");
//     outPath = path.join(tempDir, "a.out");
//     fs.writeFileSync(filePath, code);
//     command = `g++ "${filePath}" -o "${outPath}" && "${outPath}"`; // Fix for spaces
//   } else {
//     return res.status(400).json({ error: "Unsupported language" });
//   }

//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       res.json({ output: stderr || error.message });
//     } else {
//       res.json({ output: stdout || stderr });
//     }

//     // Cleanup with delay to prevent EPERM error on Windows
//     setTimeout(() => {
//       if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
//       if (outPath && fs.existsSync(outPath)) fs.unlinkSync(outPath);
//     }, 100);
//   });
// });

// ... inside your file

app.post("/run", auth, (req, res) => {
  const { language = "javascript", code, input = "" } = req.body;

  if (code === undefined || code.trim() === "") {
    return res.status(400).json({ error: "Code is empty." });
  }

  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  let process;
  const filePath = path.join(tempDir, `script.${language}`);
  fs.writeFileSync(filePath, code);

  // --- C++ Execution Logic ---
  if (language === "cpp") {
    const outPath = path.join(tempDir, "a.out");
    // 1. Compile the code
    const compile = spawn("g++", [filePath, "-o", outPath]);
    let compileError = "";
    compile.stderr.on("data", (data) => {
      compileError += data.toString();
    });
    compile.on("close", (code) => {
      if (code !== 0) {
        fs.unlinkSync(filePath); // Clean up cpp file
        return res.json({ output: compileError });
      }
      // 2. Run the compiled executable
      const run = spawn(outPath);
      let output = "";
      let runError = "";
      run.stdin.write(input); // Pipe input to the process
      run.stdin.end();
      run.stdout.on("data", (data) => {
        output += data.toString();
      });
      run.stderr.on("data", (data) => {
        runError += data.toString();
      });
      run.on("close", () => {
        fs.unlinkSync(filePath); // Clean up cpp file
        fs.unlinkSync(outPath); // Clean up executable
        res.json({ output: runError || output });
      });
    });
    return;
  }

  // --- Python & JavaScript Execution Logic ---
  const command = language === "python" ? "python" : "node";
  process = spawn(command, [filePath]);

  let output = "";
  let error = "";

  // Pipe the input string to the process's stdin
  process.stdin.write(input);
  process.stdin.end();

  process.stdout.on("data", (data) => {
    output += data.toString();
  });

  process.stderr.on("data", (data) => {
    error += data.toString();
  });

  process.on("close", (code) => {
    fs.unlinkSync(filePath); // Clean up the script file
    res.json({ output: error || output });
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
