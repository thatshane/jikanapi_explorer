interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'purple' | 'indigo' | 'gray';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color = 'blue'
}) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };
  
  const colorClasses = {
    blue: 'border-blue-100 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400',
    purple: 'border-purple-100 border-t-purple-600 dark:border-purple-800 dark:border-t-purple-400',
    indigo: 'border-indigo-100 border-t-indigo-600 dark:border-indigo-800 dark:border-t-indigo-400',
    gray: 'border-gray-200 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-300',
  };

  return (
    <div className="flex justify-center items-center py-4">
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full border-4`} 
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner; 