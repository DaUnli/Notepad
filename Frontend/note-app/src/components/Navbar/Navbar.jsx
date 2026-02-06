import React from "react";
import ProfileInfo from "../Cards/ProfileInfo";
import Searchbar from "../Searchbar/Searchbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();

  // --- Functions (Logic preserved) ---
  const onLogout = async () => {
    try {
      await axiosInstance.post("/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      navigate("/login");
    }
  };

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  return (
    <div className="bg-white sticky top-0 z-50 flex items-center justify-between px-4 md:px-6 py-2 shadow-sm border-b border-slate-100">
      {/* Logo - Hidden on very small screens if searching to save space */}
      <h2 className={`text-lg md:text-xl font-bold tracking-tight text-blue-600 transition-all ${searchQuery ? "hidden sm:block" : "block"}`}>
        NOTE<span className="text-slate-900 ml-1">NI</span>
      </h2>

      {/* Searchbar Container - Grows to fill space */}
      {userInfo && (
        <div className="flex-1 max-w-[400px] mx-2 md:mx-10">
          <Searchbar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            handleSearch={handleSearch}
            onClearSearch={onClearSearch}
          />
        </div>
      )}

      {/* Profile Section */}
      <div className="flex-shrink-0">
        <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
      </div>
    </div>
  );
};

export default Navbar;