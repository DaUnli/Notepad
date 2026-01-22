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

  const addNewNote = async () => {
    try {
      const response = await axiosInstance.post("/add-note", {
        title,
        content,
        tags,
      });

      if (response.data && response.data.note) {
        showToastMessage("Note Added Successfully");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
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

      if (response.data && response.data.note) {
        showToastMessage("Note Updated Successfully");
        getAllNotes();
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
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
    <div className="relative">
      <button
        className="w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-50"
        onClick={onClose}
      >
        <MdClose className="text-xl text-slate-400 cursor-pointer" />
      </button>

      <div className="p-4">
        <label htmlFor="" className="ml-2 font-bold">
          TITLE
        </label>
        <input
          type="text"
          placeholder="Title"
          className="w-full border border-gray-300 rounded-lg p-2 mt-1 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>
      <div className="p-4">
        <label htmlFor="" className="ml-2 font-bold">
          CONTENT
        </label>
        <textarea
          rows={10}
          placeholder="Content"
          className="w-full border border-gray-300 rounded-lg p-2 mt-1 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={content}
          onChange={({ target }) => setContent(target.value)}
        />
      </div>

      <div className="p-4">
        <label htmlFor="" className="ml-2 font-bold">
          TAG
        </label>

        <TagInput tags={tags} setTags={setTags} />
      </div>

      {error && <p className="text-red-500 text-lx pt-4">{error}</p>}

      <button
        onClick={handleAddNote}
        className="w-full bg-blue-500 text-white cursor-pointer rounded-lg p-2 mt-4 hover:bg-blue-600 transition-colors"
      >
        {type === "edit" ? "UPDATE" : "ADD"}
      </button>
    </div>
  );
};

export default AddEditNotes;
