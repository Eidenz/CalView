# CalView
CalView is a React-based calendar that integrates with a Radicale CalDAV server. It allows users to view, create, edit, and delete events, all synchronized with a Radicale backend.
![demo](https://github.com/Eidenz/CalView/assets/27901016/e4f2a2bb-9545-440d-9fd2-7d3a96b8386d)


## Features
- View calendar events
- Supports multi-day events
- Create new events
- Edit existing events
- Delete events
- Synchronization with Radicale CalDAV server

## Prerequisites
- Docker and Docker Compose
- A running Radicale CalDAV server with CORS headers configured

## Installation
- Clone the repository:
  
`git clone https://github.com/Eidenz/CalView.git`

`cd CalView`

- Create a .env file in the root directory with the following content:
```
REACT_APP_RADICALE_USERNAME=your_username
REACT_APP_RADICALE_PASSWORD=your_password
REACT_APP_RADICALE_URL=http://your_radicale_server_url:5232/your_calendar_path/
```

- Build and run the Docker container:

`docker-compose build`

`docker-compose up`

The application should now be running at http://localhost/ (or whatever port you've specified in your Docker configuration).

## Usage
- Click on a day to view events for that day
- Double-click on a day to create a new event
- Click on an event in the list to view its details
- Use the edit and delete buttons in the event details panel to modify or remove events

## Development
To run the application in development mode:
Install dependencies:
`npm install`

Start the development server:
`npm start`

The application will be available at http://localhost:3000

## Building for Production
To build the application for production:
Run the build command:
`npm run build`

The production-ready files will be in the build directory

## Docker Deployment
The application includes a Dockerfile and docker-compose.yml for easy deployment. To deploy:
Ensure Docker and Docker Compose are installed on your system
Run `docker compose up --build`

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License.
