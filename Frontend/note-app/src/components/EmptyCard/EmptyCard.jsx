import React from "react";

const EmptyCard = ({ imgSrc, message }) => {
  return (
    <div className="flex flex-col items-center justify-center mt-12 md:mt-24 px-6">
      {/* Responsive Image: Full width on tiny screens, capped on larger ones */}
      <div className="w-full max-w-[320px] md:max-w-[400px] mb-8 animate-in fade-in zoom-in duration-500">
        <img 
          src={imgSrc} 
          alt="No Notes" 
          className="w-full h-auto drop-shadow-sm opacity-80" 
        />
      </div>

      {/* Responsive Message: Better width and leading for readability */}
      <p className="w-full sm:w-3/4 md:w-1/2 text-base md:text-lg font-medium text-slate-500 text-center leading-relaxed">
        {message}
      </p>
    </div>
  );
};

export default EmptyCard;