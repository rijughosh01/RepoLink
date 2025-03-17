import React, { useState, useEffect } from "react";
import "./dashboard.css";
import Navbar from "../Navbar";
import API_BASE_URL from "../../config.js";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [visibleRepoIds, setVisibleRepoIds] = useState({});
  const [deletingRepoId, setDeletingRepoId] = useState(null);
  const [togglingVisibilityId, setTogglingVisibilityId] = useState(null);
  const [migratingVisibility, setMigratingVisibility] = useState(false);
  const [starringRepoId, setStarringRepoId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/repo/user/${userId}`);
        const data = await response.json();
        setRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/repo/all`);
        const data = await response.json();
        setSuggestedRepositories(data || []);
      } catch (err) {
        console.error("Error while fetching suggested repositories: ", err);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  useEffect(() => {
    if (!repositories || repositories.length === 0 || searchQuery === "") {
      setSearchResults(repositories || []);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  const toggleRepoIdVisibility = (repoId) => {
    setVisibleRepoIds((prevVisibleRepoIds) => ({
      ...prevVisibleRepoIds,
      [repoId]: !prevVisibleRepoIds[repoId],
    }));
  };

  const deleteRepository = async (repoId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this repository? This action cannot be undone."
    );

    if (!confirmDelete) return;

    setDeletingRepoId(repoId);
    try {
      const response = await fetch(`${API_BASE_URL}/repo/delete/${repoId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete the repository.");
      } else {
        alert(data.message || "Repository deleted successfully!");
        setRepositories((prevRepos) =>
          prevRepos.filter((repo) => repo._id !== repoId)
        );
        setSearchResults((prevResults) =>
          prevResults.filter((repo) => repo._id !== repoId)
        );
      }
    } catch (err) {
      console.error("Error while deleting repository:", err.message);
      alert("Server error. Please try again later.");
    } finally {
      setDeletingRepoId(null);
    }
  };

  const toggleVisibility = async (repoId) => {
    setTogglingVisibilityId(repoId);
    try {
      const response = await fetch(`${API_BASE_URL}/repo/toggle/${repoId}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to toggle repository visibility.");
      } else {
        alert(data.message || "Repository visibility toggled successfully!");
        setRepositories((prevRepos) =>
          prevRepos.map((repo) =>
            repo._id === repoId
              ? { ...repo, visibility: data.repository.visibility }
              : repo
          )
        );
        setSearchResults((prevResults) =>
          prevResults.map((repo) =>
            repo._id === repoId
              ? { ...repo, visibility: data.repository.visibility }
              : repo
          )
        );
      }
    } catch (err) {
      console.error("Error while toggling repository visibility:", err.message);
      alert("Server error. Please try again later.");
    } finally {
      setTogglingVisibilityId(null);
    }
  };

  const migrateVisibility = async () => {
    const confirmMigration = window.confirm(
      "Are you sure you want to migrate the visibility fields for all repositories? This action will update the database."
    );

    if (!confirmMigration) return;

    setMigratingVisibility(true);
    try {
      const response = await fetch(`${API_BASE_URL}/repo/migrate-visibility`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to migrate visibility fields.");
      } else {
        alert(data.message || "Visibility field migration completed!");
      }
    } catch (err) {
      console.error("Error while migrating visibility fields:", err.message);
      alert("Server error. Please try again later.");
    } finally {
      setMigratingVisibility(false);
    }
  };

  const starRepository = async (repoId) => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("User is not authenticated. Please log in.");
      return;
    }

    setStarringRepoId(repoId);
    try {
      const response = await fetch(`${API_BASE_URL}/repo/star/${repoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to star the repository.");
      } else {
        alert(data.message || "Repository starred successfully!");
        setRepositories((prevRepos) =>
          prevRepos.map((repo) =>
            repo._id === repoId
              ? { ...repo, stars: [...(repo.stars || []), userId] }
              : repo
          )
        );
      }
    } catch (err) {
      console.error("Error while starring repository:", err.message);
      alert("Server error. Please try again later.");
    } finally {
      setStarringRepoId(null);
    }
  };

  return (
    <>
      <Navbar />
      <section id="dashboard">
        <aside>
          <h3>Suggested Repositories</h3>
          {suggestedRepositories &&
            suggestedRepositories.map((repo) => (
              <div key={repo._id}>
                <h4>{repo.name}</h4>
                <h4>{repo.description}</h4>
              </div>
            ))}
        </aside>
        <main>
          <h2>Your Repositories</h2>
          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="migrate-button"
            onClick={migrateVisibility}
            disabled={migratingVisibility}
          >
            {migratingVisibility
              ? "Migrating Visibility Fields..."
              : "Migrate Visibility Fields"}
          </button>
          {searchResults &&
            searchResults.map((repo) => (
              <div key={repo._id}>
                <div className="repo-header">
                  <button
                    onClick={() => toggleRepoIdVisibility(repo._id)}
                    className="toggle-repo-id-button"
                    style={{
                      cursor: "pointer",
                      border: "none",
                      background: "transparent",
                    }}
                  >
                    <i
                      className="fas fa-eye"
                      title={`Toggle Repo ID for ${repo.name}`}
                    ></i>
                  </button>
                  {visibleRepoIds[repo._id] && (
                    <h4 style={{ display: "inline", marginLeft: "10px" }}>
                      Repo ID: {repo._id}
                    </h4>
                  )}
                </div>
                <h4>Name: {repo.name}</h4>
                <h4>Description: {repo.description}</h4>
                <h4>Visibility: {repo.visibility}</h4>
                <button
                  className="toggle-visibility-button"
                  onClick={() => toggleVisibility(repo._id)}
                  disabled={togglingVisibilityId === repo._id}
                >
                  {togglingVisibilityId === repo._id
                    ? "Toggling..."
                    : `Set to ${
                        repo.visibility === "public" ? "Private" : "Public"
                      }`}
                </button>
                <button
                  className="delete-button"
                  onClick={() => deleteRepository(repo._id)}
                  disabled={deletingRepoId === repo._id}
                >
                  {deletingRepoId === repo._id ? "Deleting..." : "Delete"}
                </button>
                <button
                  className="star-button"
                  onClick={() => starRepository(repo._id)}
                  disabled={starringRepoId === repo._id}
                  style={{
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                  }}
                >
                  <i
                    className={`fas fa-star ${
                      repo.stars &&
                      repo.stars.includes(localStorage.getItem("userId"))
                        ? "starred"
                        : ""
                    }`}
                    title="Star Repository"
                  ></i>
                </button>
              </div>
            ))}
        </main>
        <aside>
          <h3>Upcoming Events</h3>
          <ul>
            <li>
              <p>Tech Conference - Dec 15</p>
            </li>
            <li>
              <p>Developer Meetup - Dec 25</p>
            </li>
            <li>
              <p>React Summit - Jan 5</p>
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
};

export default Dashboard;
