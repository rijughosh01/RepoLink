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
      setError(
        "Repository name can only contain letters, numbers, dashes, and underscores."
      );
    } else {
      setError("");
    }
    setRepoName(value);
  };

  return (
    <>
      <h1 className="title">Create a New Repository</h1>
      <p className="description">
        A repository contains all your project’s files and their history. Create
        a short, memorable name to identify it easily!
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="repoName" className="label">
          Repository Name *
        </label>
        <input
          type="text"
          id="repoName"
          className="input"
          value={repoName}
          onChange={handleRepoNameChange}
          required
          placeholder="e.g., my-awesome-repo"
        />
        <p className="hint">Great repository names are short and memorable.</p>

        <label htmlFor="description" className="label">
          Description (optional)
        </label>
        <textarea
          id="description"
          className="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write a short description for your repository..."
        />

        <label className="label">Visibility</label>
        <div className="visibility">
          <label className="visibility-option">
            <input
              type="radio"
              value="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
              className="radio"
            />
            <i
              className="fas fa-globe icon"
              title="Public - Anyone on the internet can see this repository"
            ></i>
            <span className="visibility-text">
              <strong>Public</strong> – Anyone on the internet can see this
              repository.
            </span>
          </label>
          <label className="visibility-option">
            <input
              type="radio"
              value="private"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
              className="radio"
            />
            <i
              className="fas fa-lock icon"
              title="Private - Only you can see this repository"
            ></i>
            <span className="visibility-text">
              <strong>Private</strong> – You choose who can see and commit to
              this repository.
            </span>
          </label>
        </div>

        {error && <p className="error">{error}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        <button type="submit" className="button" disabled={loading}>
          {loading ? "Creating..." : "Create Repository"}
        </button>
      </form>
    </>
  );
};

export default CreateRepo;
