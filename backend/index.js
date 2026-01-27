require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./router/userrouter");

const app = express();
const port = process.env.PORT || 5000;

// IST Timezone middleware
process.env.TZ = 'Asia/Kolkata';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*', credentials: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB connected - IST"))
  .catch(err => console.log("❌ DB connection error:", err));

app.use("/", router);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port} - IST`);
});

