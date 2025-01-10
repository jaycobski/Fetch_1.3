# YFetch App

## Overview

Fetch App is the official application for [yfetch.com](https://yfetch.com), providing a powerful interface to fetch, manage, and analyze your saved content from various social platforms. Currently supporting Reddit and Twitter, with more platforms coming soon.

## Features

- **Reddit Integration**: Fetch and manage your saved Reddit posts
- **Twitter Integration**: Access and organize your Twitter bookmarks
- **Secure Authentication**: Built with Supabase for robust user management
- **Modern UI**: Crafted with React and shadcn/ui for a beautiful user experience
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Build Tool**: Vite
- **Deployment**: Netlify

## Development

To run this project locally:

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```env
VITE_REDDIT_CLIENT_ID=your_reddit_client_id
VITE_REDIRECT_URI=your_redirect_uri
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url
```

## Deployment

The app is automatically deployed to [app.yfetch.com](https://app.yfetch.com) via Netlify when changes are pushed to the main branch.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software owned by YFetch. All rights reserved.

## Links

- [YFetch Website](https://yfetch.com)
- [Documentation](https://docs.yfetch.com)
- [Support](https://yfetch.com/support)