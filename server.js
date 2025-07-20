const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public")); // optional if you add custom CSS

const PORT = 3001;

const credentials = require("./credentials.json");

// 👉 Render Login Form
app.get("/", (req, res) => {
  res.render("login", { error: null });
});

// 👉 Handle Login
app.post("/api/login", (req, res) => {
  console.log("the object is " , req.body);
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.render("login", { error: "Mobile and Password are required." });
  }

  if (credentials[mobile] !== password) {
    return res.render("login", { error: "Invalid mobile number or password." });
  }

  const userDir = path.join(__dirname, "data", mobile);

  if (!fs.existsSync(userDir)) {
    return res.render("login", { error: "User data not found." });
  }

  try {
    const files = fs.readdirSync(userDir).filter(file => file.endsWith(".json"));
    const data = {};

    files.forEach((file) => {
      const filePath = path.join(userDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      data[file] = JSON.parse(content);
    });

    res.send({
      files: data
    });
  } catch (err) {
    console.error(err);
    res.render("login", { error: "Error reading user data." });
  }
});

app.listen(PORT, () => {
  console.log(`MCP server running at http://localhost:${PORT}`);
});
