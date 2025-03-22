const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const Project = require("../models/projectModel");

const router = express.Router();
const conn = mongoose.createConnection(process.env.MONGODB_URI);

let bucket;
conn.once("open", () => {
  bucket = new GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
});

const storage = new multer.memoryStorage();
const upload = multer({ storage });

// Upload project
router.post("/upload", upload.single("project"), async (req, res) => {
  const { userId, projectName, description, repoId } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: { userId, projectName, description, repoId },
    });

    const fileId = uploadStream.id;

    // Create a promise to handle the upload
    const uploadPromise = new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    uploadStream.end(req.file.buffer);
    await uploadPromise;

    const newProject = new Project({
      userId,
      projectName,
      description,
      fileId,
      repoId,
    });

    await newProject.save();
    res
      .status(201)
      .json({ message: "Project uploaded successfully", project: newProject });
  } catch (error) {
    console.error("Error uploading project:", error);
    res.status(500).json({ error: "Failed to upload project" });
  }
});

// Get all projects
router.get("/projects/:repoId", async (req, res) => {
  const { repoId } = req.params;
  try {
    const projects = await Project.find({ repoId });
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Download project
router.get("/download/:fileId", async (req, res) => {
  const { fileId } = req.params;

  try {
    const downloadStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(fileId)
    );

    // Handle stream errors
    downloadStream.on("error", (error) => {
      if (error.code === "ENOENT") {
        res.status(404).json({ error: "File not found" });
      } else {
        console.error("Error downloading file:", error);
        res.status(500).json({ error: "Failed to download file" });
      }
    });

    res.set("Content-Type", "application/octet-stream");
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error initiating download:", error);
    res.status(500).json({ error: "Failed to initiate download" });
  }
});

// Delete project
router.delete("/projects/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    try {
      // Try to delete file from GridFS
      await bucket.delete(new mongoose.Types.ObjectId(project.fileId));
    } catch (gridfsError) {
      console.warn("GridFS file deletion failed:", gridfsError);
    }

    // Delete project from database
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

router.get("/view/:fileId", async (req, res) => {
  const { fileId } = req.params;

  try {
    const downloadStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(fileId)
    );

    // Collect data chunks
    let fileData = [];

    downloadStream.on("data", (chunk) => {
      fileData.push(chunk);
    });

    downloadStream.on("error", (error) => {
      if (error.code === "ENOENT") {
        res.status(404).json({ error: "File not found" });
      } else {
        console.error("Error reading file:", error);
        res.status(500).json({ error: "Failed to read file" });
      }
    });

    downloadStream.on("end", () => {
      const buffer = Buffer.concat(fileData);
      const content = buffer.toString("utf8");
      res.json({ content });
    });
  } catch (error) {
    console.error("Error viewing file:", error);
    res.status(500).json({ error: "Failed to view file" });
  }
});

module.exports = router;
