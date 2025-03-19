import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Navbar from "../Navbar";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import { FaCamera } from "react-icons/fa";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";

const Profile = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ username: "username" });
  const [profileImage, setProfileImage] = useState(null);
  const { setCurrentUser } = useAuth();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");

      if (userId) {
        try {
          const response = await axios.get(
            `http://localhost:3002/userProfile/${userId}`
          );
          setUserDetails(response.data);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchUserDetails();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    window.location.href = "/auth";
  };
  const handleDeleteProfile = async () => {
    const userId = localStorage.getItem("userId");

    try {
      await axios.delete(`http://localhost:3002/deleteProfile/${userId}`);
      alert("Profile deleted!");
      handleLogout();
    } catch (err) {
      console.error("Error during deleting profile: ", err);
    }
  };

  return (
    <>
      <Navbar className="nav" />
      <div className="profile__navigation">
        <UnderlineNav aria-label="Repository">
          <UnderlineNav.Item
            className="navigation__item"
            aria-current="page"
            icon={BookIcon}
            sx={{
              backgroundColor: "transparent",
              color: "white",
              "&:hover": {
                textDecoration: "underline",
                color: "white",
              },
            }}
          >
            Overview
          </UnderlineNav.Item>
          <UnderlineNav.Item
            className="navigation__item"
            onClick={() => navigate("/starred-repos")}
            icon={RepoIcon}
            sx={{
              backgroundColor: "transparent",
              color: "whitesmoke",
              "&:hover": {
                textDecoration: "underline",
                color: "white",
              },
            }}
          >
            Starred Repositories
          </UnderlineNav.Item>
        </UnderlineNav>
      </div>

      <button className="profile__logout-button" onClick={handleLogout}>
        Logout
      </button>

      <div className="profile__container">
        <div className="profile__user-section">
          <div className="profile__image-container">
            <div className="profile__image">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="profile__image-uploaded"
                />
              ) : (
                <div className="profile__image-default"></div>
              )}
            </div>

            <label htmlFor="image-upload" className="profile__upload-icon">
              <FaCamera className="profile__camera-icon" />
            </label>
            <input
              type="file"
              accept="image/*"
              id="image-upload"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </div>

          <div className="profile__username">
            <h3>{userDetails.username}</h3>
          </div>

          <button className="profile__follow-button">Follow</button>

          <div className="profile__follow-section">
            <p className="profile__followers-count">10 Followers</p>
            <p className="profile__following-count">3 Following</p>
          </div>
        </div>

        <div className="profile__heatmap-section">
          <HeatMapProfile />
        </div>
        <div className="profile__actions">
          <button onClick={handleDeleteProfile}>Delete Profile</button>
        </div>
      </div>
    </>
  );
};

export default Profile;
