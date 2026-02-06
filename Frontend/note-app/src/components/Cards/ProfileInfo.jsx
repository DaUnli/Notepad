import React from "react";
import { getInitials } from "../../utils/Helper";

const ProfileInfo = ({ userInfo, onLogout }) => {
  return (
    userInfo && (
      <div className="flex items-center gap-3">
        {/* User Avatar - Slightly more polished colors */}
        <div className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full text-slate-950 font-semibold bg-slate-100 border border-slate-200 shadow-sm shrink-0">
          {getInitials(userInfo.fullName)}
        </div>

        {/* User Details - Hidden on mobile, visible on medium screens and up */}
        <div className="hidden sm:flex flex-col">
          <p className="text-sm font-semibold text-slate-900 leading-none">
            {userInfo.fullName}
          </p>
          <button
            className="text-[12px] text-red-500 font-medium hover:underline transition-all text-left mt-1"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>

        {/* Mobile Logout Button - Icon or small text for tiny screens */}
        <button
          className="sm:hidden text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-lg active:scale-95 transition-all"
          onClick={onLogout}
        >
          LOGOUT
        </button>
      </div>
    )
  );
};

export default ProfileInfo;