import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBug } from "react-icons/fa";
import "./issues.css";
import API_BASE_URL from "../../config.js";

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    repository: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/issue/all`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to fetch issues.");
        } else {
          setIssues(data);
        }
      } catch (error) {
        console.error("Error fetching issues:", error.message);
        setError("An error occurred while fetching issues.");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/issue/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIssue),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create issue.");
      } else {
        setIssues((prevIssues) => [...prevIssues, data]);
        setNewIssue({ title: "", description: "", repository: "" });
      }
    } catch (error) {
      console.error("Error creating issue:", error.message);
      setError("An error occurred while creating the issue.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteIssue = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/issue/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete issue.");
        return;
      }

      setIssues((prevIssues) => prevIssues.filter((issue) => issue._id !== id));
    } catch (error) {
      console.error("Error deleting issue:", error.message);
      setError("An error occurred while deleting the issue.");
    }
  };

  return (
    <div className="issues-page">
      <button
        className="toggle-button"
        onClick={() => setIsPopupVisible(!isPopupVisible)}
      >
        <FaBug size={24} />
      </button>

      <h1 className="page-title">Issues</h1>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleCreateIssue} className="issue-form">
        <label htmlFor="repository" className="form-label">
          Repository ID
        </label>
        <input
          type="text"
          id="repository"
          className="form-input"
          value={newIssue.repository}
          onChange={(e) =>
            setNewIssue({ ...newIssue, repository: e.target.value })
          }
          required
          placeholder="Enter repository ID"
        />

        <label htmlFor="title" className="form-label">
          Title
        </label>
        <input
          type="text"
          id="title"
          className="form-input"
          value={newIssue.title}
          onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
          required
          placeholder="Enter issue title"
        />

        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          className="form-textarea"
          value={newIssue.description}
          onChange={(e) =>
            setNewIssue({ ...newIssue, description: e.target.value })
          }
          placeholder="Enter issue description"
        ></textarea>

        <button type="submit" className="submit-button" disabled={creating}>
          {creating ? "Creating..." : "Create Issue"}
        </button>
      </form>
      <div className={`issues-list ${isPopupVisible ? "visible" : "hidden"}`}>
        {loading ? (
          <p className="loading-message">Loading issues...</p>
        ) : issues.length === 0 ? (
          <p className="no-issues">No issues found.</p>
        ) : (
          issues.map((issue) => (
            <div key={issue._id} className="issue-item">
              <h3 className="issue-title">{issue.title}</h3>
              <p className="issue-description">{issue.description}</p>
              <Link to={`/issue/${issue._id}`} className="issue-link">
                View Details
              </Link>
              <button
                onClick={() => handleDeleteIssue(issue._id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Issues;
