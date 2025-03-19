import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faBell,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import "./navbar.css";

const Navbar = ({ searchQuery, setSearchQuery }) => {
  return (
    <header className="navbar">
      {/* Logo Section */}
      <Link to="/" className="navbar-logo">
        <img
          src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          alt="GitHub Logo"
          className="logo-image"
        />
        <h3 className="logo-text">Repo Link</h3>
      </Link>

      {/* Search Input */}
      <div className="navbar-search">
        <input
          type="text"
          value={searchQuery}
          placeholder="Search..."
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <nav className="navbar-icons">
        <Link to="/create" className="navbar-item">
          <FontAwesomeIcon icon={faPlus} className="navbar-icon" />
          <span className="navbar-hover-text">Create Repo</span>
        </Link>
        <Link to="/issues" className="navbar-item">
          <FontAwesomeIcon icon={faExclamationCircle} className="navbar-icon" />
          <span className="navbar-hover-text">Issues</span>
        </Link>
        <Link to="/notifications" className="navbar-item">
          <FontAwesomeIcon icon={faBell} className="navbar-icon" />
          <span className="navbar-hover-text">Notifications</span>
        </Link>
        <Link to="/profile" className="navbar-avatar">
          {/* Avatar Image */}
          <img
            src="https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg?t=st=1741842579~exp=1741846179~hmac=172c981c1efed1b5c986b91fef15bbb13eb0b0f7eb4882423233b3f060cc9ee6&w=740"
            alt="User Avatar"
            className="avatar-image"
          />
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
