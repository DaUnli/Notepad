import React from 'react'
import { MdAdd, MdClose } from 'react-icons/md'

const TagInput = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = React.useState("")

  // --- Logic Preserved ---
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const addNewTag = () => {
    if (inputValue.trim() !== "") {
      setTags([...tags, inputValue.trim()])
      setInputValue("")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addNewTag()
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tags Display Container */}
      {tags?.length > 0 && (
        <div className='flex items-center gap-2 flex-wrap'>
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className='flex items-center gap-1 text-[13px] font-medium text-blue-700 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100/50 transition-all'
            >
              # {tag}
              <button 
                className="hover:text-red-500 transition-colors ml-1"
                onClick={() => handleRemoveTag(tag)}
              >
                <MdClose className="text-sm" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Group */}
      <div className='flex items-center gap-3'>
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            placeholder='Add tags...'
            className='w-full text-sm bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-blue-200 transition-all'
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          onClick={addNewTag}
          className='w-10 h-10 flex justify-center items-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95'
          aria-label="Add Tag"
        >
          <MdAdd className='text-2xl' />
        </button>
      </div>
    </div>
  )
}

export default TagInput