import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateRepo.css";

const CreateRepo = () => {
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    const userId = localStorage.getItem("userId");

    if (!userId) {
      setError("User not authenticated!");
      setLoading(false);
      return;
    }

    const repoData = {
      owner: userId,
      name: repoName,
      description,
      visibility,
    };

    try {
      const response = await fetch("http://localhost:3002/repo/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(repoData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error creating repository!");
      } else {
        setSuccessMessage("Repository created successfully!");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      console.error("Error during repository creation:", err.message);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRepoNameChange = (e) => {
    const value = e.target.value;
    if (value.match(/[^a-zA-Z0-9-_]/)) {
      setError("Repository name can only contain letters, numbers, dashes, and underscores.");
    } else {
      setError("");
    }
    setRepoName(value);
  };

  return (
    <>
      <h1 className="repo-title">Create a New Repository</h1>
      <p className="repo-description">
        A repository contains all your project’s files and their history. Create a short, memorable name to identify it easily!
      </p>

      <form className="repo-form" onSubmit={handleSubmit}>
        <label htmlFor="repoName" className="form-label">Repository Name *</label>
        <input
          type="text"
          id="repoName"
          className="form-input"
          value={repoName}
          onChange={handleRepoNameChange}
          required
          placeholder="e.g., my-awesome-repo"
        />
        <p className="form-hint">
          Great repository names are short and memorable. Need inspiration? Try "stellar-octopus".
        </p>

        <label htmlFor="description" className="form-label">Description (optional)</label>
        <textarea
          id="description"
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write a short description for your repository..."
        />

        <label className="form-label">Visibility</label>
        <div className="visibility-option">
          <i className="fas fa-globe visibility-icon" title="Anyone on the internet can see this repository."></i>
          <input
            type="radio"
            value="public"
            checked={visibility === "public"}
            onChange={() => setVisibility("public")}
            id="public"
            className="visibility-radio"
          />
          <label htmlFor="public" className="visibility-label">
            <strong>Public</strong> – Anyone on the internet can see this repository.
          </label>
        </div>
        <div className="visibility-option">
          <i className="fas fa-lock visibility-icon" title="You choose who can see this repository."></i>
          <input
            type="radio"
            value="private"
            checked={visibility === "private"}
            onChange={() => setVisibility("private")}
            id="private"
            className="visibility-radio"
          />
          <label htmlFor="private" className="visibility-label">
            <strong>Private</strong> – You choose who can see and commit to this repository.
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? <div className="loading-spinner"></div> : "Create Repository"}
        </button>
      </form>

      {repoName && (
        <div className="preview-section">
          <h3>Preview</h3>
          <p><strong>Name:</strong> {repoName}</p>
          {description && <p><strong>Description:</strong> {description}</p>}
          <p><strong>Visibility:</strong> {visibility === "public" ? "Public" : "Private"}</p>
        </div>
      )}
    </>
  );
};

export default CreateRepo;
