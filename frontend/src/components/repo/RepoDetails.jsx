import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../../config.js";
import "./repoDetails.css";

const RepoDetails = () => {
  const { id } = useParams();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [repoDetails, setRepoDetails] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewContent, setViewContent] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [repoResponse, projectsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/repo/${id}`),
          axios.get(`${API_BASE_URL}/projects/${id}`),
        ]);

        setRepoDetails(repoResponse.data);
        setProjects(projectsResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load repository data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const userId = localStorage.getItem("userId");

    if (!userId) {
      setMessage("User not authenticated!");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("projectName", projectName);
    formData.append("description", description);
    formData.append("project", file);
    formData.append("repoId", id);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(response.data.message || "Project uploaded successfully!");
      setProjects((prevProjects) => [...prevProjects, response.data.project]);

      setProjectName("");
      setDescription("");
      setFile(null);
      document.getElementById("file").value = "";
    } catch (err) {
      console.error("Error during project upload:", err);
      setMessage("Failed to upload project. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (fileId, projectName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/view/${fileId}`);
      setViewContent(response.data.content);
      setViewingProject(projectName);
    } catch (err) {
      console.error("Error viewing file:", err);
      setMessage("Failed to view file content");
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/download/${fileId}`, {
        responseType: "blob",
      });

      const contentType = response.headers["content-type"];
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "project-file");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
      setMessage("Failed to download file. Please try again later.");
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await axios.delete(`${API_BASE_URL}/projects/${projectId}`);
      setProjects(projects.filter((project) => project._id !== projectId));
      setMessage("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      setMessage("Failed to delete project");
    }
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="repo-main-container">
      <div className="content-container">
        <div className="section-header">
          <h1 className="title">
            {repoDetails?.name || "Repository Projects"}
          </h1>
          <button
            className="button primary add-project-btn"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            {showUploadForm ? "Close Form" : "Add Project"}
          </button>
        </div>

        {showUploadForm && (
          <div className="upload-section">
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label htmlFor="projectName" className="label">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="projectName"
                  className="input"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="label">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  className="textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="file" className="label">
                  Upload File *
                </label>
                <input
                  type="file"
                  id="file"
                  className="file-input"
                  onChange={handleFileChange}
                  required
                />
              </div>

              {message && (
                <p className={`message ${error ? "error" : "success"}`}>
                  {message}
                </p>
              )}

              <div className="form-buttons">
                <button
                  type="submit"
                  className="button primary"
                  disabled={loading}
                >
                  {loading ? "Uploading..." : "Upload Project"}
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowUploadForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project._id} className="project-card">
              <h3 className="project-title">{project.projectName}</h3>
              <p className="project-description">{project.description}</p>
              <div className="project-actions">
                <button
                  onClick={() =>
                    handleView(project.fileId, project.projectName)
                  }
                  className="action-button view"
                >
                  View
                </button>
                <button
                  onClick={() =>
                    handleDownload(project.fileId, project.projectName)
                  }
                  className="action-button download"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="action-button delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="empty-state">
              <p>No projects uploaded yet.</p>
              <button
                className="button primary"
                onClick={() => setShowUploadForm(true)}
              >
                Add Your First Project
              </button>
            </div>
          )}
        </div>

        {viewContent && (
          <div className="project-viewer">
            <div className="viewer-header">
              <h3>Viewing: {viewingProject}</h3>
              <button
                className="close-button"
                onClick={() => {
                  setViewContent(null);
                  setViewingProject(null);
                }}
              >
                Close
              </button>
            </div>
            <pre className="content-preview">{viewContent}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoDetails;
