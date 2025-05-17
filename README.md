# Firebird REST API

A RESTful API service that provides access to Firebird databases through HTTP endpoints. This project allows you to interact with your Firebird database using standard REST API calls.

---

## 🚀 Quick Start

```bash
git clone [repository-url]
cd firebird-restapi
npm install
cp .env.example .env
# Edit .env as needed
npm run dev
```

---

## Features

- RESTful API endpoints for CRUD operations
- Secure database access via environment variables
- **High-performance Firebird connection pooling (pool size 5)**
- Centralized SQL query templates
- CORS support
- Comprehensive error handling and logging
- Consistent date formatting
- Docker support for containerized deployment

---

## Project Structure

```
firebird-restapi/
├── config/         # Configuration files
├── logs/           # Application logs
├── routes/         # API route definitions
├── services/       # Business logic and database services
├── utils/          # Utility functions and helpers
├── deploy.bat      # Deployment script
├── server.js       # Main application entry point
└── package.json    # Project dependencies and scripts
```

---

## Architecture

- **Connection Pooling:** All Firebird database access uses connection pooling (pool size 5) via `node-firebird`.
- **Centralized SQL Templates:** All SQL queries are defined in `services/sqlQueries.js`.
- **Standardized Error Handling:** All routes use a centralized logger (`winston`).
- **Consistent Date Formatting:** Handled by `convertToLocalTime` in `utils/koreanUtils.js`.

---

## Prerequisites

- Node.js (v14 or higher)
- Firebird 2.5 or higher
- Windows OS
- Docker (optional)

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
PORT=3000
FIREBIRD_HOST=host.docker.internal
FIREBIRD_PORT=3050
FIREBIRD_DATABASE=C:\path\to\your\database.FDB
FIREBIRD_USER=your_username
FIREBIRD_PASSWORD=your_password
CORS_ORIGIN=http://localhost:3000
```

---

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-reload

---

## Deployment

- Use `deploy.bat` for Windows deployment.
- For Docker, see below.

---

## Docker Deployment

```bash
docker build -t firebird-restapi .
docker run --name fbapi -p 3000:3000 --env-file .env firebird-restapi
```

---

## API Endpoints

See the [API Endpoints section above](#api-endpoints) for details on `/api/persons` and other routes.

---

## Error Handling

- Standardized error responses with HTTP status codes.
- See the Error Responses section for format and codes.

---

## Security

- Uses environment variables for sensitive info.
- CORS is restricted to allowed origins.
- Input validation and sanitization.

---

## Logging

- Uses Winston for logging.
- Logs stored in `logs/` directory.

---

## Troubleshooting

- Ensure Firebird is running and accessible.
- Check `.env` configuration.
- Review logs in `logs/` for errors.

---

## License

MIT License

---

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

---

## Contact

For questions or support, open an issue or contact the maintainer.
