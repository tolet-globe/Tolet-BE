const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const bodyParser = require("body-parser");
dotenv.config();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB } = require("./config/db.js");
const contactRoutes = require("./routes/contactRoutes.js");
const propertyRouter = require("./routes/propertyRoutes.js");
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const { errorHandler } = require("./middlewares/errorHandler.js");
const cron = require("node-cron");
const { markPropertyAsRented } = require("./utils/propertyUtils"); // Adjust the path if necessary
const faqRoutes = require("./routes/FAQroutes.js");
const pricingRoutes = require("./routes/pricingRoutes.js");
const multer = require("multer")
const upload = multer({ dest: "temp/" }); // temporary folder for multer
const { uploadOnS3 } = require("./utils/awsS3bucket.js");
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" }, // Set to true in production with HTTPS
  })
);

app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json()); // ← Ensure this is present to parse JSON bodies

app.use(helmet());
// *******Dont touch above **********

// add your routes here import here, also add here
app.use((req, res, next) => {
  next(); // Passes control to the next middleware or route handler
});
//eg.
//route import

app.get("/", (req, res) => {
  res.send("API is running....");
});

//route declaration
//http://localhost:8000/api/v1/property/add-property
app.use("/api/v1/property", propertyRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/blog", blogRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/faq", faqRoutes);
app.use("/api/v1/pricing", pricingRoutes);

// Test upload API
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to S3
    const result = await uploadOnS3(req.file.path, "test-folder/"); // optional folder

    if (!result) {
      return res.status(500).json({ message: "S3 upload failed" });
    }

    res.json({
      message: "File uploaded successfully!",
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// error handler middleware
app.use(errorHandler);

// DO NOT DELETE COMMENTED CODE

// cron.schedule('* * * * *', async () => {
//   console.log('Checking for properties to mark as rented...');
//   try {
//     await markPropertyAsRented();
//     console.log('Property statuses updated successfully.');
//   } catch (error) {
//     console.error('Error updating property statuses:', error);
//   }
// });

// *******Dont touch below **********
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`✌ server is running on port : ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGODB Connection Failed !!", error);
  });
