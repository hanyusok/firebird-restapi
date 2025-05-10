# Firebird REST API

A RESTful API service that provides access to Firebird database through HTTP endpoints. This project allows you to interact with your Firebird database using standard REST API calls.

## Features

- RESTful API endpoints for CRUD operations
- Secure database access through environment variables
- CORS support for cross-origin requests
- Comprehensive error handling
- Logging system for debugging and monitoring
- Easy deployment with automated scripts
- Docker support for containerized deployment

## Prerequisites

- Node.js (v14 or higher)
- Firebird 2.5 or higher
- Windows operating system
- Docker (optional, for containerized deployment)

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

The application can be deployed using Docker for containerized execution. Follow these steps:

1. Build the Docker image:
```bash
docker build -t firebird-restapi .
```

2. Run the container:
```bash
docker run --name fbapi -p 3000:3000 --env-file .env firebird-restapi
```

This will:
- Create a container named "firebird-api"
- Map port 3000 from the container to port 3001 on your host machine
- Use the environment variables from your .env file

To stop the container:
```bash
docker stop fbapi
```

To remove the container:
```bash
docker rm fbapi
```

To view container logs:
```bash
docker logs fbapi
```

Note: Make sure your Firebird database is accessible from the container. You may need to update the `FIREBIRD_HOST` in your `.env` file to use the correct host IP address.

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