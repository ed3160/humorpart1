'use client';

import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';
import Image from 'next/image';

export default function Home() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      setError(null);
      const { data: imageData, error: fetchError } = await supabase.from('images').select('*');

      if (fetchError) {
        console.error('Error fetching images:', fetchError.message);
        setError('Error loading images.');
      } else {
        // Filter out images that do not have a valid URL
        const filteredImages = imageData ? imageData.filter(image => image.url && typeof image.url === 'string') : [];
        setImages(filteredImages);
      }
      setLoading(false);
    }

    fetchImages();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Loading Images...</h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12">
        <h1 className="text-4xl font-bold mb-8 text-center">{error}</h1>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Images from Supabase</h1>

      {images && images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image: any) => (
            <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105">
              <div className="relative w-full h-48">
                <Image
                  src={image.url}
                  alt={image.description || 'Image from Supabase'}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{image.title || `Image ID: ${image.id}`}</h2>
                <p className="text-gray-700 text-sm">{image.description || 'No description available.'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-lg text-center">No images found or all images have invalid URLs.</p>
      )}
    </main>
  );
}
