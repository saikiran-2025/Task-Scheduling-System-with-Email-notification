require('dotenv').config();  

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rt = require("./router/userrouter");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// MongoDB Atlas connection (Render safe)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB connected"))
  .catch(err => console.log("❌ DB connection error", err));

app.use("/", rt);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
