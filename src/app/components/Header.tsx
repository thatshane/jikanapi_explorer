'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/') return pathname === path;
    return pathname?.startsWith(path);
  };
  
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex justify-between items-center mb-4 md:mb-0">
            <Link href="/" className="text-2xl font-bold hover:text-blue-100 transition-colors tracking-tight">
              AnimeDB
            </Link>
          </div>
          
          <nav className="w-full md:w-auto">
            <ul className="flex flex-wrap gap-y-2 gap-x-6">
              <li>
                <Link 
                  href="/" 
                  className={`hover:text-blue-100 transition-colors pb-1 ${
                    isActive('/') ? 'border-b-2 border-white font-medium' : ''
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/search" 
                  className={`hover:text-blue-100 transition-colors pb-1 ${
                    isActive('/search') ? 'border-b-2 border-white font-medium' : ''
                  }`}
                >
                  Search
                </Link>
              </li>
              <li>
                <Link 
                  href="/top" 
                  className={`hover:text-blue-100 transition-colors pb-1 ${
                    isActive('/top') && !isActive('/top/manga') ? 'border-b-2 border-white font-medium' : ''
                  }`}
                >
                  Top Anime
                </Link>
              </li>
              <li>
                <Link 
                  href="/top/manga" 
                  className={`hover:text-blue-100 transition-colors pb-1 ${
                    isActive('/top/manga') ? 'border-b-2 border-white font-medium' : ''
                  }`}
                >
                  Top Manga
                </Link>
              </li>
              <li>
                <Link 
                  href="/seasons" 
                  className={`hover:text-blue-100 transition-colors pb-1 ${
                    isActive('/seasons') ? 'border-b-2 border-white font-medium' : ''
                  }`}
                >
                  Seasons
                </Link>
              </li>
              <li>
                <Link 
                  href="/favorites" 
                  className={`hover:text-blue-100 transition-colors pb-1 ${
                    isActive('/favorites') ? 'border-b-2 border-white font-medium' : ''
                  }`}
                >
                  Favorites
                </Link>
              </li>
              <li>
                <Link 
                  href="/watchlist" 
                  className={`hover:text-blue-100 transition-colors pb-1 ${
                    isActive('/watchlist') ? 'border-b-2 border-white font-medium' : ''
                  }`}
                >
                  Watchlist
                </Link>
              </li>
              <li>
                <Link 
                  href="/ratings" 
                  className={`hover:text-blue-100 transition-colors pb-1 ${
                    isActive('/ratings') ? 'border-b-2 border-white font-medium' : ''
                  }`}
                >
                  Ratings
                </Link>
              </li>
              <li>
                <Link 
                  href="/history" 
                  className={`hover:text-blue-100 transition-colors pb-1 ${
                    isActive('/history') ? 'border-b-2 border-white font-medium' : ''
                  }`}
                >
                  History
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className={`hover:text-blue-100 transition-colors pb-1 ${
                    isActive('/about') ? 'border-b-2 border-white font-medium' : ''
                  }`}
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 