'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Character } from '../services/animeService';
import LoadingSpinner from './LoadingSpinner';

interface CharactersListProps {
  characters: Character[];
  isLoading?: boolean;
}

const CharactersList: React.FC<CharactersListProps> = ({ characters, isLoading = false }) => {
  // State to keep track of expanded characters
  const [expandedCharacterId, setExpandedCharacterId] = useState<number | null>(null);

  const toggleCharacter = (characterId: number) => {
    if (expandedCharacterId === characterId) {
      setExpandedCharacterId(null);
    } else {
      setExpandedCharacterId(characterId);
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <LoadingSpinner size="medium" />
        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading characters...</p>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-gray-600 dark:text-gray-300">No character information available.</p>
      </div>
    );
  }

  // Show only main and supporting characters, limit to 12 initially
  const mainCharacters = characters
    .filter(char => char.role === 'Main' || char.role === 'Supporting')
    .slice(0, 12);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {mainCharacters.map((character) => (
          <div 
            key={character.character.mal_id}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow"
          >
            <div 
              className="cursor-pointer" 
              onClick={() => toggleCharacter(character.character.mal_id)}
            >
              <div className="relative w-16 h-24 md:w-20 md:h-28">
                <Image
                  src={character.character.images.jpg.image_url || '/placeholder.png'}
                  alt={character.character.name}
                  fill
                  className="object-cover rounded"
                  sizes="(max-width: 768px) 64px, 80px"
                  quality={85}
                />
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm truncate" title={character.character.name}>
                  {character.character.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {character.role}
                </p>
              </div>
            </div>

            {/* Expanded details - voice actors */}
            {expandedCharacterId === character.character.mal_id && character.voice_actors.length > 0 && (
              <div className="p-3 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <h5 className="text-xs font-semibold mb-2">Voice Actors:</h5>
                <ul className="space-y-2">
                  {character.voice_actors
                    .filter(va => va.language === 'Japanese' || va.language === 'English')
                    .slice(0, 2)
                    .map((va) => (
                      <li key={va.person.mal_id} className="flex items-center space-x-2">
                        <div className="relative w-8 h-8">
                          <Image
                            src={va.person.images.jpg.image_url || '/placeholder.png'}
                            alt={va.person.name}
                            fill
                            className="object-cover rounded-full"
                            sizes="32px"
                            quality={85}
                          />
                        </div>
                        <div>
                          <p className="text-xs truncate" title={va.person.name}>
                            {va.person.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {va.language}
                          </p>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {characters.length > 12 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {Math.min(12, characters.length)} of {characters.length} characters
          </p>
        </div>
      )}
    </div>
  );
};

export default CharactersList; 