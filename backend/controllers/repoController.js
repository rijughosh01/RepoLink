const mongoose = require("mongoose");
const Repository = require("../models/repoModel");

// Function to create a new repository
async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }
    if (visibility !== "public" && visibility !== "private") {
      return res
        .status(400)
        .json({ error: "Visibility must be 'public' or 'private'!" });
    }

    // Create a new repository
    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues,
    });

    const result = await newRepository.save();

    res.status(201).json({
      message: "Repository created successfully!",
      repositoryID: result._id,
    });
  } catch (err) {
    console.error("Error during repository creation:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}

// Function to fetch all repositories
async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner", "username email")
      .populate("issues");

    res.json(repositories);
  } catch (err) {
    console.error("Error during fetching repositories:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}

// Function to fetch a repository by ID
async function fetchRepositoryById(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Repository ID!" });
    }

    const repository = await Repository.findById(id)
      .populate("owner", "username email")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository by ID:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}

// Function to fetch a repository by name
async function fetchRepositoryByName(req, res) {
  const { name } = req.params;

  try {
    const repository = await Repository.findOne({ name })
      .populate("owner", "username email")
      .populate("issues");

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository by name:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}

// Function to fetch repositories for a specific user
async function fetchRepositoriesForCurrentUser(req, res) {
  const { userID } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    const repositories = await Repository.find({ owner: userID });

    if (!repositories || repositories.length === 0) {
      return res
        .status(404)
        .json({ error: "No repositories found for the specified user!" });
    }

    res.json({ message: "Repositories retrieved successfully!", repositories });
  } catch (err) {
    console.error("Error during fetching repositories for user:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}

// Function to update a repository by ID
async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Repository ID!" });
    }

    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (content) repository.content.push(content);
    if (description) repository.description = description;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}

// Function to toggle repository visibility by ID
async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Repository ID!" });
    }

    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.visibility =
      repository.visibility === "public" ? "private" : "public";

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling repository visibility:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}

// Function to delete a repository by ID
async function deleteRepositoryById(req, res) {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Repository ID!" });
    }

    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}

// Function to migrate visibility field for older records
async function migrateVisibilityField(req, res) {
  try {
    await Repository.updateMany(
      { visibility: true },
      { $set: { visibility: "public" } }
    );

    await Repository.updateMany(
      { visibility: false },
      { $set: { visibility: "private" } }
    );

    res.status(200).json({ message: "Visibility field migration completed!" });
  } catch (err) {
    console.error("Error during visibility field migration:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}
// Function to star a repository by ID
async function starRepository(req, res) {
  const { id } = req.params;
  const { userID } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Repository ID!" });
    }
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }
    if (repository.stars && repository.stars.includes(userID)) {
      return res
        .status(400)
        .json({ error: "You have already starred this repository!" });
    }
    repository.stars = repository.stars || [];
    repository.stars.push(userID);

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository starred successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during starring repository:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
  migrateVisibilityField,
  starRepository,
};
