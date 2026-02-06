import React, { useEffect } from "react";
import { LuCheck } from "react-icons/lu";
import { MdDeleteOutline } from "react-icons/md";

const Toast = ({ isShown, message, type, onClose }) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 right-6 md:top-24 md:right-10 transition-all duration-400 z-[100] ${
        isShown ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`relative min-w-[280px] md:min-w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden`}
      >
        {/* Progress Bar Decorator */}
        <div 
          className={`absolute left-0 top-0 h-full w-[6px] ${
            type === "delete" ? "bg-red-500" : "bg-green-500"
          }`}
        />

        <div className="flex items-center gap-4 py-3 px-5">
          {/* Icon Container */}
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${
              type === "delete" ? "bg-red-50" : "bg-green-50"
            }`}
          >
            {type === "delete" ? (
              <MdDeleteOutline className="text-xl text-red-500" />
            ) : (
              <LuCheck className="text-xl text-green-500" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {type === "delete" ? "Deleted" : "Success"}
            </span>
            <p className="text-sm font-medium text-slate-700 leading-tight">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;