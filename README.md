# Firebird REST API

A robust RESTful API service built with TypeScript and Express.js that provides access to Firebird databases. This project allows seamless interaction with your Firebird database using standard HTTP methods.

## 🚀 Features

- **TypeScript**: Written in TypeScript for type safety and better maintainability.
- **Firebird Integration**: Efficient connection pooling with `node-firebird`.
- **RESTful Endpoints**: CRUD operations for `PERSON`, `MTSMTR` (Medical Treatment Records), and `MTSWAIT` (Waiting List).
- **Swagger Documentation**: Interactive API documentation available at `/api-docs`.
- **Security**: Implements `helmet` for security headers and `cors` for cross-origin resource sharing.
- **Logging**: Structured logging using `winston`.

## 📋 Prerequisites

- **Node.js**: v14 or higher (v20+ recommended).
- **Firebird Database**: Firebird 2.5 or higher.
- **Network**: Access to the machine hosting the Firebird database (ensure port 3050 is open).

## 🛠️ Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hanyusok/firebird-restapi.git
    cd firebird-restapi
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory. You can use the example below:

    ```env
    # Server Configuration
    PORT=3000
    CORS_ORIGIN=*

    # Firebird Database Configuration
    FIREBIRD_HOST=192.168.0.12  # IP of the Firebird server
    FIREBIRD_PORT=3050
    FIREBIRD_USER=SYSDBA
    FIREBIRD_PASSWORD=masterkey

    # Database Paths (Local paths on the Firebird server)
    FIREBIRD_PERSON_DATABASE=C:\Mts3\Db\MTSDB.FDB
    FIREBIRD_MTSWAIT_DATABASE=C:\Mts3\Db\MTSWAIT.FDB
    FIREBIRD_MTSMTR_DATABASE=C:\Mts3\Db\MTSMTR.FDB
    ```

## 🏃‍♂️ Usage

### Development Mode
Runs the server with `nodemon` and `ts-node` for hot-reloading.
```bash
npm run dev
```

### Production Build
Compiles the TypeScript code to JavaScript in the `dist/` directory.
```bash
npm run build
```

### Start Production Server
Runs the compiled JavaScript from the `dist/` directory.
```bash
npm start
```

## 📚 API Documentation

Once the server is running, you can access the Swagger UI documentation at:

**[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

This interactive interface allows you to test endpoints directly from the browser.

## 📂 Project Structure

```
firebird-restapi/
├── dist/               # Compiled JavaScript (generated)
├── docs/               # Documentation files (DDL, etc.)
├── scripts/            # Helper scripts (e.g., deploy.bat)
├── src/                # Source Code
│   ├── config/         # Database and Swagger config
│   ├── middleware/     # Express middleware (validation, errors)
│   ├── routes/         # API Route definitions
│   ├── schemas/        # Joi validation schemas
│   ├── services/       # Business logic and DB queries
│   ├── utils/          # Helper functions (logging, formatting)
│   ├── app.ts          # App setup
│   └── server.ts       # Entry point
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## 📝 Scripts

- `npm run dev`: Start in development mode.
- `npm run build`: Compile TypeScript to JavaScript.
- `npm start`: Start the production server.
- `npm run typecheck`: Run TypeScript type checking without emitting files.

## 📄 License

MIT License
