import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const IssueDetails = () => {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3002/issue/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Error fetching issue details");
        } else {
          setIssue(data);
        }
      } catch (error) {
        console.error("Error fetching issue details:", error.message);
        setError("Failed to fetch issue details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchIssueDetails();
  }, [id]);

  if (loading) {
    return <p>Loading issue details...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="issue-details-page">
      <h1>{issue.title}</h1>
      <p>{issue.description}</p>
      <p>Status: {issue.status}</p>
      <p>Repository ID: {issue.repository}</p>
    </div>
  );
};

export default IssueDetails;
