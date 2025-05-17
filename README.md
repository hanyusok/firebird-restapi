# Firebird REST API

A RESTful API service that provides access to Firebird database through HTTP endpoints. This project allows you to interact with your Firebird database using standard REST API calls.

## Features

- RESTful API endpoints for CRUD operations
- Secure database access through environment variables
- **High-performance Firebird connection pooling (pool size 5) for all database operations**
- Centralized SQL query templates for all tables/entities
- CORS support for cross-origin requests
- Comprehensive error handling with centralized logging
- Consistent date formatting using shared utilities
- Logging system for debugging and monitoring
- Easy deployment with automated scripts
- Docker support for containerized deployment

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

## Architecture

- **Connection Pooling:** All Firebird database access uses connection pooling (pool size 5) via `node-firebird` for high concurrency and efficient resource management.
- **Centralized SQL Templates:** All SQL queries are defined in `services/sqlQueries.js` for maintainability and consistency across services.
- **Standardized Error Handling:** All routes use a centralized logger (`winston`) for error handling and logging, ensuring consistent error responses and log management.
- **Consistent Date Formatting:** All date formatting is handled by the shared `convertToLocalTime` utility in `utils/koreanUtils.js` for uniformity across the codebase.

## Prerequisites

- Node.js (v14 or higher)
- Firebird 2.5 or higher
- Windows operating system
- Docker (optional, for containerized deployment)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd firebird-restapi
```

2. Install dependencies:
```bash
npm install
```

3. Configure the environment:
   - Copy the `.env.example` file to `.env`
   - Update the following variables in `.env`:
     ```
     PORT=3000
     FIREBIRD_HOST=host.docker.internal
     FIREBIRD_PORT=3050
     FIREBIRD_DATABASE=C:\path\to\your\database.FDB
     FIREBIRD_USER=your_username
     FIREBIRD_PASSWORD=your_password
     CORS_ORIGIN=http://localhost:3000
     ```

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-reload

## Deployment

The project includes a deployment script (`deploy.bat`) that handles the setup and running of the server. To deploy:

1. Ensure Firebird is installed and running
2. Verify your `.env` file is properly configured
3. Run the deployment script:
```bash
deploy.bat
```

The script will:
- Verify Node.js installation
- Check Firebird installation
- Validate environment variables
- Install dependencies
- Start the server
- Wait for server to be ready
- Display the API URL

To stop the server, press `Ctrl+C`.

## Docker Deployment

You can run the Firebird REST API in a Docker container for easy deployment and isolation.

### 1. Build the Docker image

```bash
# From the project root directory:
docker build -t firebird-restapi .
```

### 2. Run the Docker container

```bash
docker run --name fbapi -p 3000:3000 --env-file .env firebird-restapi
```

- `--name fbapi`: Names the container `fbapi` for easy reference.
- `-p 3000:3000`: Maps port 3000 in the container to port 3000 on your host.
- `--env-file .env`: Loads environment variables from your local `.env` file (make sure it is configured for your Firebird server).
- `firebird-restapi`: The name of the image you built.

### 3. Stopping and removing the container

To stop the container:
```bash
docker stop fbapi
```

To remove the container:
```bash
docker rm fbapi
```

### 4. Viewing logs

```bash
docker logs fbapi
```

### 5. Troubleshooting
- Ensure your Firebird database is accessible from the container. If running Firebird on your host, you may need to set `FIREBIRD_HOST=host.docker.internal` in your `.env` file.
- If you use a remote Firebird server, set `FIREBIRD_HOST` to the appropriate IP or hostname.
- Make sure the port in `FIREBIRD_PORT` matches your Firebird server's port (default is 3050).
- If you change the container port, update the `-p` flag accordingly.

## API Endpoints

### Persons

#### Get All Persons
- **Endpoint**: `GET /api/persons`
- **Description**: Retrieves a list of all persons with optional filtering and pagination
- **Query Parameters**:
  - `page` (optional): Page number for pagination (default: 1)
  - `limit` (optional): Number of items per page (default: 10)
  - `search` (optional): Search term to filter persons by name or other fields
  - `sort` (optional): Field to sort by (e.g., 'name', 'birthdate')
  - `order` (optional): Sort order ('asc' or 'desc')
- **Response**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "birthdate": "1990-01-01",
        "gender": "M",
        "cpf": "12345678901",
        "rg": "1234567",
        "email": "john@example.com",
        "phone": "1234567890",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipcode": "10001",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
  ```

#### Get Person by ID
- **Endpoint**: `GET /api/persons/:id`
- **Description**: Retrieves a specific person by their ID
- **Response**:
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "birthdate": "1990-01-01",
    "gender": "M",
    "cpf": "12345678901",
    "rg": "1234567",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipcode": "10001",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
  ```

#### Create Person
- **Endpoint**: `POST /api/persons`
- **Description**: Creates a new person record
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "birthdate": "1990-01-01",
    "gender": "M",
    "cpf": "12345678901",
    "rg": "1234567",
    "email": "john@example.com",
    "phone": "1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipcode": "10001"
  }
  ```
- **Response**: Returns the created person object with ID and timestamps

#### Update Person
- **Endpoint**: `PUT /api/persons/:id`
- **Description**: Updates an existing person record
- **Request Body**: Same as create, but all fields are optional
- **Response**: Returns the updated person object

#### Delete Person
- **Endpoint**: `DELETE /api/persons/:id`
- **Description**: Deletes a person record
- **Response**: Returns a success message

### Field Descriptions

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | integer | Unique identifier | No (auto-generated) |
| name | string | Full name of the person | Yes |
| birthdate | date | Date of birth (YYYY-MM-DD) | Yes |
| gender | string | Gender (M/F) | Yes |
| cpf | string | Brazilian tax ID | Yes |
| rg | string | Brazilian ID number | Yes |
| email | string | Email address | No |
| phone | string | Phone number | No |
| address | string | Street address | No |
| city | string | City name | No |
| state | string | State abbreviation | No |
| zipcode | string | Postal code | No |
| created_at | datetime | Record creation timestamp | No (auto-generated) |
| updated_at | datetime | Last update timestamp | No (auto-generated) |

### Search Capabilities

The API supports advanced search functionality through the `GET /api/persons/search` endpoint:

1. **Search by Name (PNAME)**:
   - Use the `pname` parameter to search by person's name
   - Example: `GET /api/persons/search?pname=John`

2. **Search by Code (PCODE)**:
   - Use the `pcode` parameter to search by person's code
   - Example: `GET /api/persons/search?pcode=123`

3. **Search by Search ID (SEARCHID)**:
   - Use the `searchId` parameter to search by person's search ID
   - Example: `GET /api/persons/search?searchId=540401-2`

4. **Combined Search**:
   - Only one search parameter can be used at a time
   - The API will return a 400 error if no search parameter is provided
   - The API will return a 404 error if no matching person is found

### Error Responses

The API returns standardized error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details if available
    }
  }
}
```

Common error codes:
- `INVALID_INPUT`: Request validation failed
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ENTRY`: Attempt to create duplicate record
- `DATABASE_ERROR`: Database operation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions

## Dependencies

- **express**: Web framework for Node.js
- **node-firebird**: Firebird database driver
- **iconv-lite**: Character encoding conversion
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing middleware
- **winston**: Logging library

## Error Handling

The API returns appropriate HTTP status codes and error messages:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Security

- The API uses environment variables for sensitive information
- CORS is configured to allow requests only from specified origins
- Database credentials are never exposed in the code
- Input validation and sanitization
- Error messages are sanitized to prevent information leakage

## Logging

The application uses Winston for logging:
- Logs are stored in the `logs/` directory
- Different log levels (error, warn, info, debug)
- Log rotation and retention policies

## Troubleshooting

If you encounter issues:

1. Check if Firebird service is running
2. Verify database path and credentials in `.env`
3. Ensure Node.js is properly installed
4. Check if the port (3000) is not in use by another application
5. Review the logs in the `logs/` directory for detailed error information

## License

[Your License Here]

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 