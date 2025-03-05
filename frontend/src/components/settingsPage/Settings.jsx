import React, { useState } from "react";
import { FaPalette, FaCalendarAlt, FaBell, FaLock, FaPowerOff, FaGlobe } from "react-icons/fa";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    app: true,
    sound: false,
    taskUpdates: true,
    messages: true,
    reminders: true,
    health: false,
    focusMode: false,
  });

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [dateFormat, setDateFormat] = useState("MM/DD/YY");
  const [timeFormat, setTimeFormat] = useState("digital");

  const handleNotificationChange = (type) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
<div className="w-full min-h-screen px-6">
  {/* My Settings Heading */}
  <h1 className="text-4xl font-semibold text-[#4D4D4D] mx-2 pt-4 mb-8">
    My Settings
  </h1>

  {/* Grid Layout for Setting Boxes */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    {/* Theme Settings */}
    <div className={`p-4 rounded-lg shadow-md border-2 w-full ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-black text-black"}`}>
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FaPalette /> Theme Settings
      </h2>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-medium">Light Mode</span>
        <button onClick={() => setDarkMode(!darkMode)} className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}>
          <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${darkMode ? "translate-x-7" : "translate-x-0"}`} />
        </button>
        <span className="font-medium">Dark Mode</span>
      </div>
    </div>

    {/* Notifications */}
    <div className={`p-6 rounded-lg shadow-md border-2 w-full ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-black text-black"}`}>
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FaBell /> Notifications Settings
      </h2>
      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={notifications.taskUpdates} onChange={() => handleNotificationChange("taskUpdates")} className="w-5 h-5 cursor-pointer" />
          Task Updates
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={notifications.messages} onChange={() => handleNotificationChange("messages")} className="w-5 h-5 cursor-pointer" />
          Messages
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={notifications.health} onChange={() => handleNotificationChange("health")} className="w-5 h-5 cursor-pointer" />
          Health Notifications
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={notifications.focusMode} onChange={() => handleNotificationChange("focusMode")} className="w-5 h-5 cursor-pointer" />
          Focus Mode Notifications
        </label>
      </div>
    </div>
  </div>

  {/* Second Grid Row */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    {/* Time Zone Select */}
    <div className={`p-6 rounded-lg shadow-md border-2 w-full ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-black text-black"}`}>
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FaGlobe /> Global Time Zone
      </h2>
      <div className="mt-4">
        <label className="block font-medium">Select Country</label>
        <select className={`w-full mt-2 p-2 border rounded-md ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
          <option value="">-- Select Country --</option>
          <option value="Argentina">Argentina</option>
          <option value="Australia">Australia</option>
          <option value="Austria">Austria</option>
        </select>
        <label className="block font-medium mt-4">Select City</label>
        <select className={`w-full mt-2 p-2 border rounded-md ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedCountry}>
          <option value="">-- Select City --</option>
          {selectedCountry === "USA" && (
            <>
              <option value="New York">New York</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="Chicago">Chicago</option>
              <option value="San Francisco">San Francisco</option>
            </>
          )}
          {selectedCountry === "UK" && (
            <>
              <option value="London">London</option>
              <option value="Manchester">Manchester</option>
              <option value="Birmingham">Birmingham</option>
              <option value="Liverpool">Liverpool</option>
            </>
          )}
        </select>
      </div>
    </div>

    {/* Date and Time */}
    <div className={`p-6 rounded-lg shadow-md border-2 w-full ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-black text-black"}`}>
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FaCalendarAlt /> Date & Time Format
      </h2>
      <div className="mt-4">
        <h3 className="text-l font-medium">Date Format</h3>
        <div className="mt-2 flex gap-4">
          <button onClick={() => setDateFormat("MM/DD/YY")} className={`px-4 py-2 rounded-md ${dateFormat === "MM/DD/YY" ? "bg-gray-600 text-white" : "bg-gray-300 text-black hover:bg-gray-400"}`}>
            MM/DD/YY
          </button>
          <button onClick={() => setDateFormat("DD/MM/YY")} className={`px-4 py-2 rounded-md ${dateFormat === "DD/MM/YY" ? "bg-gray-600 text-white" : "bg-gray-300 text-black hover:bg-gray-400"}`}>
            DD/MM/YY
          </button>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-l font-medium">Time Format</h3>
        <div className="mt-2 flex gap-4">
          <button onClick={() => setTimeFormat("digital")} className={`px-4 py-2 rounded-md ${timeFormat === "digital" ? "bg-gray-600 text-white" : "bg-gray-300 text-black hover:bg-gray-400"}`}>
            Digital
          </button>
          <button onClick={() => setTimeFormat("analog")} className={`px-4 py-2 rounded-md ${timeFormat === "analog" ? "bg-gray-600 text-white" : "bg-gray-300 text-black hover:bg-gray-400"}`}>
            Analog
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Account Settings (Adjusted to Match Box Width & Alignment) */}
  <div className="w-full md:w-[100%] mx-auto">
    <div className={`p-5 rounded-lg shadow-md border-2 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-black text-black"}`}>
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
</div>

  );
};

export default Settings;