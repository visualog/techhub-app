'use client';

export function Avatar() {
  return (
    <div className="relative w-10 h-10 overflow-hidden bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center cursor-pointer">
      <svg 
        className="w-8 h-8 text-neutral-500 dark:text-neutral-400" 
        fill="currentColor" 
        viewBox="0 0 20 20" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          fillRule="evenodd" 
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
          clipRule="evenodd"
        ></path>
      </svg>
    </div>
  );
}
