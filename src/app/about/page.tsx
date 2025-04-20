import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">About AnimeDB</h1>
      
      <section className="mb-8">
        <p className="mb-4 text-lg">
          AnimeDB is a web application that provides information about anime series and movies. 
          It uses the <a href="https://jikan.moe/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Jikan API</a>, 
          which is an unofficial MyAnimeList API, to fetch anime data.
        </p>
        <p className="mb-4">
          This site was built as a demonstration project using React, Next.js, and Tailwind CSS. 
          It showcases how to create a responsive web application that interacts with a third-party API.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Browse popular anime titles</li>
          <li>Search for specific anime by title</li>
          <li>View detailed information about each anime</li>
          <li>Save your favorites and manage your watchlist</li>
          <li>Rate anime and track your personal ratings</li>
          <li>View and manage your viewing history</li>
          <li>Responsive design that works on desktop and mobile devices</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Technologies Used</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Next.js:</strong> React framework for server-rendered applications</li>
          <li><strong>React:</strong> JavaScript library for building user interfaces</li>
          <li><strong>TypeScript:</strong> Typed superset of JavaScript</li>
          <li><strong>Tailwind CSS:</strong> Utility-first CSS framework</li>
          <li><strong>Jikan API:</strong> Unofficial MyAnimeList API</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Future Improvements</h2>
        <p className="mb-4">
          We're constantly improving AnimeDB. In future updates, we plan to add:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Manga information and browsing</li>
          <li>More detailed character profiles</li>
          <li>Personalized anime recommendations based on your ratings</li>
          <li>User accounts to sync your data across devices</li>
          <li>Advanced filtering and sorting options</li>
          <li>Social features to share and discuss anime with friends</li>
        </ul>
      </section>

      <div className="mt-8">
        <Link href="/" className="text-blue-600 hover:underline">
          &#8592; Return to homepage
        </Link>
      </div>
    </div>
  );
} 