# QuickAid Admin Dashboard

This is a custom admin dashboard for the QuickAid application. It provides a user-friendly interface to manage and monitor all aspects of the QuickAid system.

## Features

- **Dashboard Overview**: View key statistics and metrics at a glance
- **User Management**: View and manage all users in the system
- **Emergency Request Tracking**: Monitor and manage emergency requests
- **Certification Management**: Review and approve first responder certifications
- **Training Video Management**: Add, edit, and delete training videos

## Setup

1. Make sure the backend server is running
2. Access the admin dashboard at: `http://localhost:5000/admin`
3. Login with the credentials defined in your `.env` file:
   - Username: `ADMIN_USERNAME` (default: admin)
   - Password: `ADMIN_PASSWORD` (default: quickaid123)

## Security

The admin dashboard is protected with basic authentication. To change the admin credentials:

1. Update the `ADMIN_USERNAME` and `ADMIN_PASSWORD` variables in your `.env` file
2. Restart the server

## Implementation Details

The admin dashboard is implemented as a single-page application (SPA) with the following components:

- **Backend**: Express.js routes and API endpoints in `router.js`
- **Frontend**: HTML, CSS, and JavaScript in the `views` directory
- **Authentication**: Basic HTTP authentication

## Customization

To customize the admin dashboard:

1. Modify the HTML in `views/index.html` to change the layout and structure
2. Update the CSS in `views/styles.css` to change the appearance
3. Modify the JavaScript in `views/app.js` to change the functionality

## API Endpoints

The admin dashboard uses the following API endpoints:

- `GET /admin/api/stats`: Get dashboard statistics
- `GET /admin/api/users`: Get all users
- `GET /admin/api/users/:id`: Get user by ID
- `GET /admin/api/emergency-requests`: Get all emergency requests
- `GET /admin/api/emergency-requests/:id`: Get emergency request by ID
- `GET /admin/api/certifications`: Get all certifications
- `PUT /admin/api/certifications/:userId`: Update certification status
- `GET /admin/api/training-videos`: Get all training videos
- `POST /admin/api/training-videos`: Create a new training video
- `PUT /admin/api/training-videos/:id`: Update a training video
- `DELETE /admin/api/training-videos/:id`: Delete a training video
