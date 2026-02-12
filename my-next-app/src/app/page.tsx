'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSupabase } from '@/components/SupabaseProvider';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase, session } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    async function fetchImages() {
      if (!session) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const { data: imageData, error: fetchError } = await supabase.from('images').select('*');

      if (fetchError) {
        console.error('Error fetching images:', fetchError.message);
        setError('Error loading images.');
      } else {
        const filteredImages = imageData ? imageData.filter(image => image.url && typeof image.url === 'string') : [];
        setImages(filteredImages);
      }
      setLoading(false);
    }

    fetchImages();
  }, [session]); // Re-fetch when session changes

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading && session) {
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
      <div className="w-full flex justify-end p-4">
        {session ? (
          <div className="flex items-center space-x-4">
            <span className="text-lg">Welcome, {session.user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login with Google
          </button>
        )}
      </div>

      <h1 className="text-4xl font-bold mb-8 text-center">Images from Supabase</h1>

      {session ? (
        images && images.length > 0 ? (
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
        )
      ) : (
        <p className="text-xl text-center">Please log in to view the images.</p>
      )}
    </main>
  );
}
