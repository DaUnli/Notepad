import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Password = ({ value, onChange, placeholder, ...props }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const isTooShort = value && value.length < 8;

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10
            ${
              isTooShort
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          value={value}
          onChange={onChange}
          type={isShowPassword ? "text" : "password"}
          placeholder={placeholder || "Password"}
          minLength={8}
          required
          {...props}
        />

        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {isShowPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
        </button>
      </div>

      {/* Validation message */}
      {isTooShort && (
        <p className="mt-1 text-sm text-red-500">
          Password must be at least 8 characters
        </p>
      )}
    </div>
  );
};

export default Password;
