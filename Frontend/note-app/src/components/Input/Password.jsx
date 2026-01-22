import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Password = ({ value, onChange, placeholder }) => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  return (
    <div className="relative w-full">
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
        value={value}
        onChange={onChange}
        type={isShowPassword ? "text" : "password"}
        placeholder={placeholder || "Password"}
      />

      <span
        onClick={toggleShowPassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
      >
        {isShowPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
      </span>
    </div>
  );
};

export default Password;
