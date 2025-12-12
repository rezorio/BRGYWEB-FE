# BRGY Frontend

A modern, responsive Vue 3 frontend application for the BRGY Web Portal with comprehensive authentication system.

## Features

### 🔐 Authentication System
- **Secure Login/Registration** with JWT tokens
- **Role-Based Access Control (RBAC)** with three roles:
  - Citizen (Basic access)
  - Admin (Administrative access)
  - Super Admin (Full system access)
- **Token Refresh** mechanism for extended sessions
- **Protected Routes** with navigation guards

### 🎨 Modern UI/UX
- **Responsive Design** built with Tailwind CSS
- **Mobile-First** approach
- **Professional Components** with smooth animations
- **Accessibility** focused design

### 🛠 Technical Stack
- **Vue 3** with Composition API
- **Pinia** for state management
- **Vue Router** for navigation
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Font Awesome** for icons

### 📱 Pages & Components
- **Authentication**: Login, Register pages
- **Dashboard**: User dashboard with statistics
- **Profile**: User profile management
- **Admin Panel**: User management and system settings
- **Navigation**: Responsive navigation with user menu
- **Toast Notifications**: Global notification system

## Setup

### Prerequisites
- Node.js 18+ 
- Vue 3
- Backend API running on http://localhost:3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Configuration

### API Configuration
The application is configured to connect to a NestJS backend running on `http://localhost:3000`. API endpoints are proxied through Vite for development.

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:3000
```

## Usage

### Default Login Credentials
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: Admin

### Registration
New users can register with any of the three roles:
- Citizen: Basic access
- Admin: Administrative access  
- Super Admin: Full system access

### Features Overview

#### For Citizens
- View dashboard with personal information
- Edit profile and manage account settings
- Access community resources

#### For Administrators
- Manage users and roles
- Access admin panel with user management
- View system statistics and activity logs
- Configure system settings

#### For Super Administrators
- All admin privileges
- System-wide configuration
- Advanced user management

## Project Structure

```
src/
├── assets/          # Static assets and styles
├── components/      # Vue components
│   ├── common/      # Reusable components
│   └── layout/      # Layout components
├── router/          # Vue Router configuration
├── services/        # API services
├── stores/          # Pinia stores
├── views/           # Page components
│   ├── auth/        # Authentication pages
│   └── admin/       # Admin pages
├── App.vue          # Root component
└── main.js          # Application entry point
```

## Security Features

- JWT token authentication
- Automatic token refresh
- Role-based route protection
- Secure API communication
- XSS protection
- CSRF protection

## Development

### Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

### Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

### Adding New Features
1. Create components in `src/components/`
2. Add routes in `src/router/index.js`
3. Update stores in `src/stores/`
4. Follow Vue 3 Composition API patterns

### Styling
- Uses Tailwind CSS for utility-first styling
- Custom component classes defined in `src/assets/main.css`
- Responsive design with mobile-first approach

### API Integration
- Axios configured with interceptors
- Automatic token handling
- Error handling with toast notifications
- Request/response interceptors for authentication

## Deployment

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Contributing

1. Follow Vue 3 best practices
2. Use Composition API
3. Maintain responsive design
4. Test authentication flows
5. Update documentation

## License

This project is licensed under the MIT License.
