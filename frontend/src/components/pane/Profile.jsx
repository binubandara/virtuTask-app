import React from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();

    return (
        <div className="profile" onClick={() => navigate("/pane/profile")} style={{ cursor: "pointer" }}>
            <img src="src/assets/profile.jpg" alt="Profile" className="profile-img" />
            <span className="profile-name">Dinaya Gomes</span>
        </div>
    );
};

export default Profile;



