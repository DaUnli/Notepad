import React from "react";

const EmptyCard = ({ imgSrc, message }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <img src={imgSrc} alt="No Notes" className="w-96" />
      <p className="w-2/3 text-lg font-bold text-slate-700 text-center leading-8 mt-8">
        {message}
      </p>
    </div>
  );
};

export default EmptyCard;