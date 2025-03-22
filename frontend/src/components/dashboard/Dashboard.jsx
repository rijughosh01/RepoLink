import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const [starringRepoId, setStarringRepoId] = useState(null);
  const [showSuggestedRepos, setShowSuggestedRepos] = useState(false);

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
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <section id="dashboard">
        <aside className={`side-menu ${showSuggestedRepos ? "open" : ""}`}>
          <button
            onClick={() => setShowSuggestedRepos(!showSuggestedRepos)}
            className="toggle-suggested-button"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          {showSuggestedRepos && (
            <div className="suggested-repos-menu">
              <h3>Suggested Repositories</h3>
              <ul>
                {suggestedRepositories &&
                  suggestedRepositories.map((repo) => (
                    <li key={repo._id}>
                      <Link
                        to={`/repo/${repo._id}`}
                        className="suggested-repo-link"
                      >
                        {repo.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </aside>
        <main>
          <h2>Your Repositories</h2>
          {searchResults &&
            searchResults.map((repo) => (
              <div key={repo._id} className="repo-section">
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
                    <h4 className="repo-id">ID: {repo._id}</h4>
                  )}
                </div>
                <div className="repo-details">
                  <Link to={`/repo/${repo._id}`} className="repo-title-link">
                    <h4 className="repo-title">{repo.name}</h4>
                  </Link>
                  <p className="repo-description">{repo.description}</p>
                  <div className="repo-visibility">{repo.visibility}</div>
                  <button
                    className="delete-button"
                    onClick={() => deleteRepository(repo._id)}
                    disabled={deletingRepoId === repo._id}
                  >
                    {deletingRepoId === repo._id ? "Deleting..." : "Delete"}
                  </button>
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
                </div>
              </div>
            ))}
        </main>
        <aside className="events-section">
          <h3>Upcoming Events</h3>
          <ul className="events-list">
            <li className="event-item">
              <h4>Tech Conference</h4>
              <p>Date: Dec 15</p>
              <p>Time: 10:00 AM - 4:00 PM</p>
              <p>Location: Tech Park, Building A</p>
              <p>
                Description: A conference to discuss the latest in technology.
              </p>
            </li>
            <li className="event-item">
              <h4>Developer Meetup</h4>
              <p>Date: Dec 25</p>
              <p>Time: 1:00 PM - 5:00 PM</p>
              <p>Location: Downtown Conference Center</p>
              <p>
                Description: A meetup for developers to network and share
                knowledge.
              </p>
            </li>
            <li className="event-item">
              <h4>React Summit</h4>
              <p>Date: Jan 5</p>
              <p>Time: 9:00 AM - 3:00 PM</p>
              <p>Location: Online</p>
              <p>Description: A summit focused on React and its ecosystem.</p>
            </li>
            <li className="event-item">
              <h4>AI Workshop</h4>
              <p>Date: Jan 20</p>
              <p>Time: 11:00 AM - 2:00 PM</p>
              <p>Location: Innovation Hub</p>
              <p>Description: A workshop on the latest advancements in AI.</p>
            </li>
            <li className="event-item">
              <h4>Cloud Expo</h4>
              <p>Date: Feb 10</p>
              <p>Time: 9:00 AM - 5:00 PM</p>
              <p>Location: Convention Center</p>
              <p>
                Description: An expo showcasing cloud technologies and services.
              </p>
            </li>
            <li className="event-item">
              <h4>JavaScript Bootcamp</h4>
              <p>Date: Feb 25</p>
              <p>Time: 10:00 AM - 4:00 PM</p>
              <p>Location: Online</p>
              <p>
                Description: An intensive bootcamp on JavaScript programming.
              </p>
            </li>
            <li className="event-item">
              <h4>Cybersecurity Summit</h4>
              <p>Date: Mar 5</p>
              <p>Time: 9:00 AM - 3:00 PM</p>
              <p>Location: Tech Park, Building B</p>
              <p>
                Description: A summit focused on cybersecurity trends and
                practices.
              </p>
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
};

export default Dashboard;
