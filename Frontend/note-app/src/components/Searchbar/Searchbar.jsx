import React from 'react'
import { FaSearch, FaTimes } from 'react-icons/fa'


const Searchbar = ({ value, onChange, handleSearch, onClearSearch }) => {
  return (
    <div className="w-80 flex items-center px-4 border border-gray-300 rounded-lg">
      <input 
        type="text" 
        placeholder="Search notes..."
        className="w-full text-xs bg-transparent outline-none py-[11px]"
        value={value}
        onChange={onChange}
      />

        <FaSearch className="text-gray-400 cursor-pointer" onClick={handleSearch} />
        {value && <FaTimes className="text-gray-400 cursor-pointer ml-2" onClick={onClearSearch} />}
    </div>
  )
}

export default Searchbar
