import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Firebird REST API',
            version: '1.0.0',
            description: 'API for accessing Firebird person database',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    // Point to .ts files in development (src) or .js files in production (dist)
    apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};

const specs = swaggerJsdoc(options);

export default specs;
