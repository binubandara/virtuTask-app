import React, { useState } from "react";
import { FaUser, FaPalette, FaBell, FaLock, FaTrash, FaPowerOff } from "react-icons/fa";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    app: true,
    sound: false,
  });

  return (
    <div className={`p-8 w-full ${darkMode ? "bg-gray-900 text-white" : "bg-[white] text-black"}`}>
      {/* Profile Settings */}
      <div
        className={`p-6 rounded-lg shadow-md mb-6 border-2 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-[white] border-black text-black"}`}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaUser /> Profile Settings
        </h2>
        <div className="mt-4">
          <label className="block font-medium">Name</label>
          <input
            type="text"
            placeholder="Your Name"
            className={`w-full mt-2 p-2 border rounded-md ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
          />

          <label className="block font-medium mt-4">Email</label>
          <input
            type="email"
            placeholder="Your Email"
            className={`w-full mt-2 p-2 border rounded-md ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
          />

          <label className="block font-medium mt-4">Profile Picture</label>
          <input
            type="file"
            className={`w-full mt-2 p-2 border rounded-md ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
          />
        </div>
      </div>

      {/* Theme Settings */}
      <div
        className={`p-6 rounded-lg shadow-md mb-6 border-2 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-black text-black"}`}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaPalette /> Theme Settings
        </h2>
        <div className="mt-4 flex items-center justify-between">
          <span>Dark Mode</span>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
      </div>

      {/* Account Settings */}
      <div
        className={`p-6 rounded-lg shadow-md border-2 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-black text-black"}`}
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaLock /> Account Settings
        </h2>
        <div className="mt-4 flex justify-between">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Change Password
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2">
            <FaPowerOff /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
