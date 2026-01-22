import React from 'react'
import {MdAdd, MdClose} from 'react-icons/md'

const TagInput = ({tags, setTags}) => {
  const [inputValue, setInputValue] = React.useState("")

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
    <div>
      {tags?.length > 0 && (
        <div className='flex items-center gap-2 flex-wrap mt-2'>
          {tags.map((tag, index) => (
            <span key={index} className='flex items-center gap-2 text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded'>
            # {tag}
            <button onClick={() => {
              handleRemoveTag(tag)
            }}>
            <MdClose />
            </button>
            </span>
          ))}
        </div>
      )}
      

      <div className='flex items-center gap-4 mt-3'>
        <input 
        type="text" 
        value={inputValue}
        placeholder='Add Tags' 
        className='p-2 border border-gray-300 rounded-lg'
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        /> 

        <button 
        onClick={() => {
          addNewTag()
        }}
        className='w-8 h-8 border border-blue-700 flex justify-center items-center rounded hover:bg-blue-600'>
          <MdAdd className='text-3xl text-blue-700 hover:text-white' />
        </button>
      </div>
    </div>
  )
}

export default TagInput
