const express = require("express");
const app = express();
app.use(express.json());

const mongoose = require("mongoose");
const { userRouter } = require("./user");
const cors = require("cors");
const path = require("path");

// Enable CORS
app.use(cors());

// Database Connection
async function main() {
  await mongoose.connect("mongodb+srv://sugam7212:Sugam_88@cluster0.uabtp.mongodb.net/SE_project");
  console.log("Mongo connected");

  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}
main();

// API Routes
app.use("/user", userRouter);

// Serve static files from the Vite build folder
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});
console.log(`Serving static files from ${frontendPath}`);