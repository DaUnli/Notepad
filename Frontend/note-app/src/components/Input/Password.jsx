import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Password = ({ value, onChange, placeholder }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div className="relative w-full group">
      <input
        value={value}
        onChange={onChange}
        type={isShowPassword ? "text" : "password"}
        placeholder={placeholder || "Password"}
        className="w-full text-sm bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 pr-12 outline-none focus:bg-white focus:border-blue-200 transition-all text-slate-900 placeholder:text-slate-400"
      />

      {/* Larger touch target for the toggle button */}
      <button
        type="button" // Prevents form submission when clicking the eye
        onClick={toggleShowPassword}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-blue-600 active:bg-slate-100 transition-all"
      >
        {isShowPassword ? (
          <FaRegEyeSlash className="text-xl" />
        ) : (
          <FaRegEye className="text-xl" />
        )}
      </button>
    </div>
  );
};

export default Password;