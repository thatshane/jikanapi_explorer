'use client';

import { useState } from 'react';

interface RatingSelectorProps {
  initialRating: number | null;
  onRate: (score: number) => void;
  onRemove?: () => void;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const RatingSelector: React.FC<RatingSelectorProps> = ({
  initialRating,
  onRate,
  onRemove,
  readOnly = false,
  size = 'medium'
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const maxStars = 10;
  const displayRating = hoverRating !== null ? hoverRating : initialRating;
  
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };
  
  const starClass = sizeClasses[size];
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        {Array.from({ length: maxStars / 2 }).map((_, index) => {
          const starValue = (index + 1) * 2;
          const isActive = displayRating !== null && displayRating >= starValue - 1;
          const isHalfStar = displayRating !== null && displayRating === starValue - 1;
          
          return (
            <div 
              key={index}
              className="relative"
              onMouseEnter={() => !readOnly && setHoverRating(starValue)}
              onMouseLeave={() => !readOnly && setHoverRating(null)}
              onClick={() => !readOnly && onRate(starValue)}
            >
              {isHalfStar ? (
                <div className="relative">
                  {/* Half filled star */}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                    className={`${starClass} text-yellow-500`}
                  >
                    <defs>
                      <linearGradient id={`halfStar${index}`}>
                        <stop offset="50%" stopColor="currentColor" />
                        <stop offset="50%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <path 
                      fillRule="evenodd" 
                      fill={`url(#halfStar${index})`}
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill={isActive ? "currentColor" : "none"}
                  stroke="currentColor"
                  className={`${starClass} ${isActive ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={isActive ? 0 : 1.5}
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" 
                  />
                </svg>
              )}
              
              {/* Half-star hover targets */}
              {!readOnly && (
                <>
                  <div 
                    className="absolute top-0 left-0 w-1/2 h-full cursor-pointer z-10"
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      setHoverRating(starValue - 1);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRate(starValue - 1);
                    }}
                  />
                  <div 
                    className="absolute top-0 right-0 w-1/2 h-full cursor-pointer z-10"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {displayRating !== null && (
        <div className="flex items-center mt-2">
          <span className="text-lg font-bold text-yellow-600 dark:text-yellow-500">
            {displayRating / 2}/5
          </span>
          
          {onRemove && !readOnly && (
            <button
              onClick={() => onRemove()}
              className="ml-2 text-gray-500 hover:text-red-500"
              aria-label="Remove rating"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingSelector; 