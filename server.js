const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

const credentials = require("./credentials.json");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public")); // Optional

// ✅ Health Check
app.get("/", (req, res) => {
  res.json({ message: "Mock Fi MCP server is running 🚀" });
});

// ✅ POST /api/login - Authenticate and return mock financial data
app.post("/api/login", (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ error: "Mobile and Password are required." });
  }

  if (credentials[mobile] !== password) {
    return res.status(401).json({ error: "Invalid mobile number or password." });
  }

  const userDir = path.join(__dirname, "data", mobile);

  if (!fs.existsSync(userDir)) {
    return res.status(404).json({ error: "User data not found." });
  }

  try {
    const files = fs.readdirSync(userDir).filter(file => file.endsWith(".json"));
    const data = {};

    files.forEach((file) => {
      const filePath = path.join(userDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      data[file] = JSON.parse(content);
    });

    return res.status(200).json({ files: data });
  } catch (err) {
    console.error("❌ Error reading files:", err.message);
    return res.status(500).json({ error: "Error reading user data." });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ MCP server running at http://localhost:${PORT}`);
});
