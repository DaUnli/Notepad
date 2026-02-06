import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const Searchbar = ({ value, onChange, handleSearch, onClearSearch }) => {
  return (
    <div className="flex items-center w-full px-4 bg-slate-50 border border-slate-100 rounded-xl group focus-within:bg-white focus-within:border-blue-200 focus-within:shadow-sm transition-all">
      <input 
        type="text" 
        placeholder="Search notes..."
        className="w-full text-sm bg-transparent py-2.5 outline-none text-slate-900 placeholder:text-slate-400"
        value={value}
        onChange={onChange}
        // Allows user to press "Enter" to search
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />

      <div className="flex items-center gap-2 md:gap-3">
        {/* Clear icon with larger touch target for mobile */}
        {value && (
          <button 
            onClick={onClearSearch}
            className="p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <FaTimes className="text-lg text-slate-400 hover:text-slate-600" />
          </button>
        )}

        {/* Search icon with larger touch target */}
        <button 
          onClick={handleSearch}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
        >
          <FaSearch className="text-base" />
        </button>
      </div>
    </div>
  );
};

export default Searchbar;