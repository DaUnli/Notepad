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
    <div className="border border-gray-300 cursor-pointer bg-white rounded-xl p-4 hover:shadow-xl transition-all ease-in-out">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h6 className="text-sm font-medium">{title}</h6>
          <span className="text-xs text-slate-500">{date}</span>
        </div>
        <MdPushPin
          className={`cursor-pointer ${
            isPinned ? "text-yellow-500" : "text-gray-400"
          }`}
          onClick={onPinNote}
        />
      </div>
      <p className="text-xs text-slate-600 mt-2">{content?.slice(0, 60)}</p>

      <div className="flex justify-between items-center mb-2 mt-2">
        <div className="text-xs text-slate-500">{tag.map((item) => ` #${item}`)}</div>
        <div className="flex items-center gap-2">
          <FaEdit
            className="icon-btn hover:text-green-600"
            onClick={onEdit}
          />
          <FaTrash
            className="icon-btn hover:text-red-500"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
