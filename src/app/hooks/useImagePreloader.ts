'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to preload images for better visual experience
 * @param imageUrls Array of image URLs to preload
 * @returns Object containing loading state
 */
export const useImagePreloader = (imageUrls: string[]) => {
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  useEffect(() => {
    // Skip if no images to load
    if (!imageUrls || !imageUrls.length) {
      setImagesPreloaded(true);
      return;
    }

    let loadedImages = 0;
    const totalImages = imageUrls.length;

    // Create array of image load promises
    const imagePromises = imageUrls.map(url => {
      return new Promise<void>((resolve, reject) => {
        if (!url || url === '/placeholder.png') {
          // If URL is placeholder or empty, consider it loaded
          loadedImages++;
          resolve();
          return;
        }

        const img = new Image();
        img.src = url;
        
        img.onload = () => {
          loadedImages++;
          resolve();
        };
        
        img.onerror = () => {
          // Consider error as loaded (we'll use fallback)
          loadedImages++;
          resolve();
        };
      });
    });

    // Wait for all images to load or fail
    Promise.all(imagePromises)
      .then(() => {
        console.log(`Preloaded ${loadedImages}/${totalImages} images`);
        setImagesPreloaded(true);
      })
      .catch(() => {
        // If any fail, still mark as done (will use fallbacks)
        setImagesPreloaded(true);
      });
  }, [imageUrls]);

  return { imagesPreloaded };
};

export default useImagePreloader; 