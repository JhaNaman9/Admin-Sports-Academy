# Sports Academy Admin Panel

A complete React.js admin panel for a sports management system, designed as a production-ready, standalone project using Material-UI (MUI v5).

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Built with Material-UI v5 with a sports-themed design
- **Complete Pages**: Login, Dashboard, Users, Subscriptions, Tournaments, Coaches, Announcements, and Settings
- **Static Content**: Ready-to-use static content for demonstration purposes
- **Modular Structure**: Organized code with proper separation of concerns

## Tech Stack

- React.js (Create React App)
- Material-UI v5 (MUI)
- React Router v6
- Axios (for future API integration)

## Prerequisites

- Node.js 14.0 or later
- npm 6.0 or later

## Installation

1. Clone the repository:
```
git clone <repository-url>
cd sports-admin-panel
```

2. Install dependencies:
```
npm install
```

## Running the Application

Start the development server:
```
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Building for Production

Create a production build:
```
npm run build
```

This will generate a `build` folder with optimized files ready for deployment.

## Project Structure

```
sports-admin-panel/
├── public/                # Static files
├── src/                   # Source code
│   ├── assets/            # Images and assets
│   ├── components/        # Reusable components
│   │   ├── Header.js      # App header
│   │   ├── Sidebar.js     # Navigation sidebar
│   │   ├── DashboardCard.js # Dashboard metric card
│   │   └── LoginForm.js   # Login form
│   ├── layouts/           
│   │   └── MainLayout.js  # Main layout with sidebar and header
│   ├── pages/             # Application pages
│   │   ├── Login.js       # Login page
│   │   ├── Dashboard.js   # Dashboard page
│   │   ├── Users.js       # Users management
│   │   ├── Subscriptions.js # Subscription plans
│   │   ├── Tournaments.js # Tournament management
│   │   ├── Coaches.js     # Coaches management
│   │   ├── Announcements.js # Announcements
│   │   └── Settings.js    # Admin settings
│   ├── App.js             # Application root
│   ├── theme.js           # MUI theme customization
│   └── index.js           # Entry point
└── package.json           # Dependencies and scripts
```

## Demo Login

Use the following credentials to log in:
- Email: admin@sports.com
- Password: admin123

## Customization

### Theme

The theme colors and other design elements can be customized in `src/theme.js`.

### Adding Real Data

To connect to a real backend:
1. Create API service files in a new `src/services/` directory
2. Use Axios to make API calls
3. Replace the static data in the pages with API calls

## License

MIT

## Author

Created by [Your Name]
