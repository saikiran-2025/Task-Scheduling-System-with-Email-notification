require('dotenv').config();  

let express = require("express");
let mongoose = require("mongoose");
let cors = require("cors");
let rt = require("./router/userrouter");  // ✅ Fixed path
let nodemailer = require("nodemailer");  
let app = express();

app.use(express.json());
app.use(cors());

// ✅ FIXED: createTransport (NOT createTransporter)
const transporter = nodemailer.createTransport({  // ← LINE 14 FIXED
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email config error:", error.message);
  } else {
    console.log("✅ Email config verified successfully");
  }
});

mongoose.connect("mongodb://localhost:27017/task_scheduler")
  .then(() => console.log("✅ DB connected"))
  .catch(err => console.log("❌ DB connection error", err));

app.use("/", rt);

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
