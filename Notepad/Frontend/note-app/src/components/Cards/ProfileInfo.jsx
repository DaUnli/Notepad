import React from "react";
import { getInitials } from "../../utils/Helper";

const ProfileInfo = ({ userInfo, onLogout }) => {
  return (
    userInfo && (
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-white">
          {getInitials(userInfo.fullName)}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-black">{userInfo.fullName}</p>
          <button
            className="text-sm text-slate-700 underline cursor-pointer"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    )
  );
};

export default ProfileInfo;
