import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { MdPushPin } from "react-icons/md";

const NoteCard = ({
  title,
  date,
  content,
  tag,
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
}) => {
  return (
    <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[180px]">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-4">
            <h6 className="text-base font-semibold text-slate-900 leading-tight">
              {title}
            </h6>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              {date}
            </span>
          </div>
          
          {/* Pin Button - Larger touch target for mobile */}
          <button 
            onClick={onPinNote}
            className={`p-2 rounded-full transition-colors ${
              isPinned ? "bg-blue-50 text-blue-600" : "text-slate-300 hover:bg-slate-50"
            }`}
          >
            <MdPushPin className="text-xl" />
          </button>
        </div>

        {/* Content - Improved readability */}
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {content?.slice(0, 80)}{content?.length > 80 && "..."}
        </p>
      </div>

      <div className="flex justify-between items-end">
        {/* Tags - Styled as actual pill badges */}
        <div className="flex flex-wrap gap-1 max-w-[70%]">
          {tag.map((item, index) => (
            <span 
              key={index} 
              className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium"
            >
              #{item}
            </span>
          ))}
        </div>

        {/* Action Buttons - Larger and spaced out for fingers */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            aria-label="Edit Note"
          >
            <FaEdit className="text-lg" />
          </button>
          <button
            onClick={onDelete}
            className="p-2.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
            aria-label="Delete Note"
          >
            <FaTrash className="text-base" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;