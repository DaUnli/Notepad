import React from "react";
import TagInput from "../../components/Input/TagInput";
import { MdClose } from "react-icons/md";
import axiosInstance from "../../utils/axiosInstance";

const AddEditNotes = ({
  noteData,
  type,
  getAllNotes,
  onClose,
  showToastMessage,
}) => {
  const [title, setTitle] = React.useState(noteData?.title || "");
  const [content, setContent] = React.useState(noteData?.content || "");
  const [tags, setTags] = React.useState(noteData?.tags || []);
  const [error, setError] = React.useState(null);

  // --- Functions (Logic preserved) ---
  const addNewNote = async () => {
    try {
      const response = await axiosInstance.post("/add-note", {
        title,
        content,
        tags,
      });
      if (response.data) {
        showToastMessage("Note Added Successfully");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const EditNote = async () => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put("/edit-note/" + noteId, {
        title,
        content,
        tags,
      });
      if (response.data?.note) {
        showToastMessage("Note Updated Successfully");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleAddNote = () => {
    if (!title) {
      setError("Please Enter the Title");
      return;
    }
    if (!content) {
      setError("Please Enter the Content");
      return;
    }
    setError("");
    if (type === "edit") {
      EditNote();
    } else {
      addNewNote();
    }
  };

  return (
    <div className="relative p-1">
      {/* Header & Close Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-slate-900">
          {type === "edit" ? "Edit Note" : "New Note"}
        </h2>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          onClick={onClose}
        >
          <MdClose className="text-2xl" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Title Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            TITLE
          </label>
          <input
            type="text"
            placeholder="Go to Gym"
            className="text-2xl font-medium text-slate-950 outline-none bg-slate-50 p-3 rounded-xl border border-transparent focus:bg-white focus:border-blue-100 transition-all"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            CONTENT
          </label>
          <textarea
            rows={10}
            placeholder="Start writing..."
            className="text-sm text-slate-700 leading-relaxed outline-none bg-slate-50 p-3 rounded-xl border border-transparent focus:bg-white focus:border-blue-100 transition-all resize-none"
            value={content}
            onChange={({ target }) => setContent(target.value)}
          />
        </div>

        {/* Tags Section */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
            TAGS
          </label>
          <div className="p-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <TagInput tags={tags} setTags={setTags} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-red-500 text-xs font-medium text-center">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleAddNote}
        className="w-full bg-blue-600 text-white font-semibold rounded-xl py-3.5 mt-8 shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        {type === "edit" ? "UPDATE NOTE" : "SAVE NOTE"}
      </button>
    </div>
  );
};

export default AddEditNotes;