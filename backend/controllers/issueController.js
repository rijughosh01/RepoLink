const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

// Create a new issue
async function createIssue(req, res) {
  const { title, description, repository } = req.body;

  try {
    if (!repository) {
      return res
        .status(400)
        .json({ error: "Repository ID is required to create an issue!" });
    }
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and description are required fields!" });
    }

    // Create and save the issue
    const issue = new Issue({
      title,
      description,
      repository,
    });

    const savedIssue = await issue.save();
    res.status(201).json(savedIssue);
  } catch (err) {
    console.error("Error during issue creation:", err.message);
    res.status(500).json({ error: "Server error during issue creation." });
  }
}

// Update an issue by ID
async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;

  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    issue.title = title;
    issue.description = description;
    issue.status = status;

    const updatedIssue = await issue.save();
    res.json({ message: "Issue updated successfully", updatedIssue });
  } catch (err) {
    console.error("Error during issue update:", err.message);
    res.status(500).send("Server error during issue update.");
  }
}

// Delete an issue by ID
async function deleteIssueById(req, res) {
  const { id } = req.params;

  try {
    const issue = await Issue.findByIdAndDelete(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json({ message: "Issue deleted successfully" });
  } catch (err) {
    console.error("Error during issue deletion:", err.message);
    res.status(500).send("Server error during issue deletion.");
  }
}

// Fetch all issues for a repository
async function getAllIssues(req, res) {
  try {
    const issues = await Issue.find();

    if (!issues || issues.length === 0) {
      return res.status(404).json({ error: "No issues found." });
    }

    res.status(200).json(issues);
  } catch (err) {
    console.error("Error during issue fetching:", err.message);
    res.status(500).send("Server error during issue fetching.");
  }
}

// Fetch an issue by ID
async function getIssueById(req, res) {
  const { id } = req.params;

  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    res.json(issue);
  } catch (err) {
    console.error("Error during issue fetching:", err.message);
    res.status(500).send("Server error during issue fetching.");
  }
}

module.exports = {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};
