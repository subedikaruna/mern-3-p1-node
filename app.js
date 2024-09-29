require("dotenv").config();
const express = require("express");
const connectToDatabase = require("./database");

const app = express();
app.use(express.json());
const { multer, storage } = require("./middleware/multerConfig");
const Blog = require("./model/blogModel");
const upload = multer({ storage: storage });
const fs = require("fs");
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://digitalpathshala.vercel.app",
      "https://www.hahahehehuhu.xyz",
    ],
  })
);

connectToDatabase();

app.get("/", (req, res) => {
  res.status(200).json({
    hello: "This is home page",
  });
});

app.post("/blog", upload.single("image"), async (req, res) => {
  const { title, subtitle, description } = req.body;
  let filename;
  if (req.file) {
    filename = "https://mern3-node.onrender.com/" + req.file.filename;
  } else {
    filename =
      "https://cdn.mos.cms.futurecdn.net/i26qpaxZhVC28XRTJWafQS-1200-80.jpeg";
  }

  if (!title || !subtitle || !description) {
    return res.status(400).json({
      message: "Please provide title,subtitle,description",
    });
  }
  await Blog.create({
    title: title,
    subtitle: subtitle,
    description: description,
    image: filename,
  });
  res.status(200).json({
    message: "Blog api hit successfully",
  });
});

app.get("/blog", async (req, res) => {
  const blogs = await Blog.find(); // returns array
  res.status(200).json({
    message: "Blogs fetched successfully",
    data: blogs,
  });
});

app.get("/blog/:id", async (req, res) => {
  const id = req.params.id;
  const blog = await Blog.findById(id); // object

  if (!blog) {
    return res.status(404).json({
      message: "no data found",
    });
  }

  res.status(200).json({
    message: "Fetched successfully",
    data: blog,
  });
});
app.delete("/blog/:id", async (req, res) => {
  const id = req.params.id;
  const blog = await Blog.findById(id);
  const imageName = blog.image;

  fs.unlink(`storage/${imageName}`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("File deleted successfully");
    }
  });
  await Blog.findByIdAndDelete(id);
  res.status(200).json({
    message: "Blog deleted successfully",
  });
});

app.patch("/blog/:id", upload.single("image"), async (req, res) => {
  const id = req.params.id;
  const { title, subtitle, description } = req.body;
  let imageName;
  if (req.file) {
    imageName = "https://mern3-node.onrender.com/" + req.file.filename;
    const blog = await Blog.findById(id);
    const oldImageName = blog.image;

    fs.unlink(`storage/${oldImageName}`, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("File deleted successfully");
      }
    });
  }
  await Blog.findByIdAndUpdate(id, {
    title: title,
    subtitle: subtitle,
    description: description,
    image: imageName,
  });
  res.status(200).json({
    message: "Blog updated successfully",
  });
});

app.use(express.static("./storage"));

app.listen(process.env.PORT, () => {
  console.log("NodeJs project has started");
});

// mongodb+srv://digitalpathshala:<password>@cluster0.iibdr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
