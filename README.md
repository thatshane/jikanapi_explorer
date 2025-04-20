# AnimeDB - React/Next.js Anime Database

A modern, responsive anime database web application built with Next.js, React, TypeScript, and Tailwind CSS. This project uses the [Jikan API](https://jikan.moe/) to fetch and display anime data from MyAnimeList.

## Features

- Browse popular anime with pagination
- Search for anime by title
- View detailed information about each anime including synopsis, rating, episodes, etc.
- Watch trailers when available
- Responsive design that works on desktop and mobile devices

## Screenshots

(Add screenshots of your application here once it's running)

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Jikan API (MyAnimeList unofficial API)

## Prerequisites

- Node.js 18.17 or later

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd anime-db
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/app` - Next.js pages and routes
- `/app/components` - Reusable UI components
- `/app/services` - API services and data fetching logic
- `/public` - Static assets

## API Information

This project uses the Jikan API, which is an unofficial MyAnimeList API. The API is free to use and doesn't require authentication, but it has rate limits to prevent abuse.

- API Base URL: https://api.jikan.moe/v4
- API Documentation: https://docs.api.jikan.moe/

## Future Improvements

- Add manga browsing functionality
- Add character profiles
- Implement user authentication
- Add watchlist and favorites functionality
- Add user reviews and ratings

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Jikan API](https://jikan.moe/) for providing the anime data
- [MyAnimeList](https://myanimelist.net/) as the original data source
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
