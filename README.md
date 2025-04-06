# AeroQube News App Frontend

A modern news application that delivers news content in multiple Indian languages with text-to-speech capabilities.

## Features

- **Multilingual Support**: Access news in 19 Indian languages including Hindi, Bengali, Telugu, Tamil, and more
- **Text-to-Speech**: Listen to news articles with high-quality voice synthesis
- **Admin Dashboard**: Manage news content, approve articles, and monitor content
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Language Switching**: Instantly switch between languages while maintaining context

## Technology Stack

- React.js with Vite for fast development and builds
- Material UI for modern, responsive UI components
- Context API for state management
- Axios for API communication
- React Router for navigation

## Supported Languages

The application supports 19 Indian languages:

- English (Indian)
- Hindi (हिन्दी)
- Bengali (বাংলা)
- Telugu (తెలుగు)
- Tamil (தமிழ்)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)
- Urdu (اردو)
- Assamese (অসমীয়া)
- Bhojpuri (भोजपुरी)
- Konkani (कोंकणी)
- Maithili (मैथिली)
- Manipuri (মৈতৈলোন্)
- Odia (ଓଡ଼ିଆ)
- Sanskrit (संस्कृतम्)
- Sindhi (سنڌي)

## Getting Started

### Prerequisites

- Node.js (version 16.x or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/karthikeya775/aeroqube-FrontEnd-prototype.git
   cd aeroqube-FrontEnd-prototype
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
frontend/
├── public/          # Public assets
├── src/
│   ├── Components/  # Reusable components
│   │   ├── Admin/   # Admin dashboard pages
│   │   └── User/    # User-facing pages
│   ├── contexts/    # React context providers
│   ├── utils/       # Utility functions and API
│   ├── App.jsx      # Main application component
│   └── main.jsx     # Application entry point
├── package.json     # Project dependencies
└── vite.config.js   # Vite configuration
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production-ready app
- `npm run preview` - Preview the built app locally

## Environment Variables

The application requires the following environment variables:

- `VITE_API_BASE_URL` - Base URL for the backend API

## Backend Integration

This frontend application communicates with a dedicated Node.js backend that provides:

- News content management
- Language translation
- Text-to-speech conversion
- User authentication
- Content moderation

## License

This project is licensed under the MIT License.

## Acknowledgements

- Material UI for the component library
- React-Router for navigation
- Vite for the build system
