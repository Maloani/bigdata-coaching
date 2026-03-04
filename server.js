require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 🔎 Vérification variables obligatoires
const requiredEnv = ["DB_USER", "DB_PASSWORD", "DB_NAME"];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
});

// 🔗 Connexion MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000
});

// ================= API ROUTES =================

app.get("/api", (req, res) => {
  res.json({
    status: "success",
    message: "Big Data Coaching API OK 🚀"
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() as time");
    res.json({
      status: "connected",
      database_time: rows[0].time
    });
  } catch (err) {
    console.error("DB ERROR:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

// ================= REACT BUILD =================

// Servir le build React
app.use(express.static(path.join(__dirname, "dist")));

// Toutes les routes non-API vont vers React
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ================= START SERVER =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});