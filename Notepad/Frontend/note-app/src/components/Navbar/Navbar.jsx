import React from "react";
import ProfileInfo from "../Cards/ProfileInfo";
import Searchbar from "../Searchbar/Searchbar";
import { useNavigate } from "react-router-dom";

const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch()
  };
  return (
    <div className="bg-white flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-2 drop-shadow">
      <div className="w-full sm:w-auto flex items-center justify-between mb-2 sm:mb-0">
        <h2 className="text-xl font-medium text-black">NOTE NI </h2>
        <div className="sm:hidden">
          <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
        </div>
      </div>

      <Searchbar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />
      <div className="hidden sm:block">
        <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
      </div>
    </div>
  );
};

export default Navbar;
