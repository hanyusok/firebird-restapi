# Firebird REST API

A RESTful API service that provides access to Firebird databases through HTTP endpoints. This project allows you to interact with your Firebird database using standard REST API calls, with ngrok tunneling for external access.

## 🚀 Quick Start

1. Clone and setup:
```bash
git clone [repository-url]
cd firebird-restapi
npm install
```

2. Create a `.env` file with your configuration:
```env
# API Configuration
PORT=3000
CORS_ORIGIN=http://localhost:3000

# Firebird Configuration
FIREBIRD_HOST=localhost
FIREBIRD_PORT=3050
FIREBIRD_PERSON_DATABASE=C:\path\to\your\PERSON.FDB
FIREBIRD_MTSWAIT_DATABASE=C:\path\to\your\MTSWAIT.FDB
FIREBIRD_MTSMTR_DATABASE=C:\path\to\your\MTSMTR.FDB
FIREBIRD_USER=your_username
FIREBIRD_PASSWORD=your_password

# ngrok Configuration
NGROK_AUTHTOKEN=your_ngrok_authtoken
NGROK_DOMAIN=your.ngrok.domain
```

3. Start the API server:
```bash
start-api.bat
```

This will start:
- REST API server on port 3000
- ngrok tunnel for external access

## Features

- RESTful API endpoints for CRUD operations
- Secure database access via environment variables
- **High-performance Firebird connection pooling (pool size 5)**
- Centralized SQL query templates
- CORS support
- Comprehensive error handling and logging
- Consistent date formatting
- Automatic ngrok tunnel setup

## Project Structure

```
firebird-restapi/
├── config/         # Configuration files
├── logs/          # Application logs
├── routes/        # API route definitions
├── services/      # Business logic and database services
├── utils/         # Utility functions and helpers
├── server.js      # Main application entry point
├── start-api.bat  # Startup script
└── package.json   # Project dependencies and scripts
```

## Architecture

- **Connection Pooling:** All Firebird database access uses connection pooling (pool size 5) via `node-firebird`
- **Centralized SQL Templates:** All SQL queries are defined in `services/sqlQueries.js`
- **Standardized Error Handling:** All routes use a centralized logger (`winston`)
- **Consistent Date Formatting:** Handled by `convertToLocalTime` in `utils/koreanUtils.js`
- **ngrok Integration:** Automatic tunnel setup with custom domain support

## Prerequisites

- Node.js (v14 or higher)
- Firebird 2.5 or higher
- Windows OS
- ngrok account with authtoken

## Environment Variables

Required environment variables in `.env`:

```env
# API Configuration
PORT=3000
CORS_ORIGIN=http://localhost:3000

# Firebird Configuration
FIREBIRD_HOST=localhost
FIREBIRD_PORT=3050
FIREBIRD_PERSON_DATABASE=C:\path\to\your\PERSON.FDB
FIREBIRD_MTSWAIT_DATABASE=C:\path\to\your\MTSWAIT.FDB
FIREBIRD_MTSMTR_DATABASE=C:\path\to\your\MTSMTR.FDB
FIREBIRD_USER=your_username
FIREBIRD_PASSWORD=your_password

# ngrok Configuration
NGROK_AUTHTOKEN=your_ngrok_authtoken
NGROK_DOMAIN=your.ngrok.domain
```

## Starting the Application

The application can be started using the provided batch file:

1. Run the startup script:
```bash
start-api.bat
```

2. The script will:
   - Change to the correct directory
   - Start the API server
   - Initialize the ngrok tunnel
   - Minimize the command window

## ngrok Tunnel

The application automatically configures an ngrok tunnel with:
- Custom domain support
- Persistent connections
- Secure authentication
- Automatic reconnection

Current Configuration:
- Domain: prompt-liberal-vulture.ngrok-free.app
- Region: US
- Port: 3000

## API Endpoints

See the [API Endpoints section above](#api-endpoints) for details on `/api/persons` and other routes.

## Error Handling

- Standardized error responses with HTTP status codes
- Centralized error logging
- Logs stored in the logs directory

## Security

- Environment variables for sensitive information
- CORS restrictions
- Input validation and sanitization
- Secure tunnel configuration

## Logging

- Uses Winston for logging
- Logs stored in `logs/` directory
- Structured logging format

## Troubleshooting

1. Database Connection Issues:
   - Verify database paths in `.env`
   - Check Firebird service is running
   - Ensure database files are accessible

2. ngrok Tunnel Issues:
   - Verify NGROK_AUTHTOKEN is correct
   - Check for conflicting tunnel sessions
   - Review ngrok logs

3. API Server Issues:
   - Check application logs in logs directory
   - Verify environment variables
   - Ensure ports are not in use

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Contact

For questions or support, open an issue or contact the maintainer.
