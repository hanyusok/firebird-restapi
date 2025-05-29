# Use Node.js LTS version as base image
FROM node:18-slim

# Set container metadata
LABEL maintainer="hanyusok@gmail.com"
LABEL name="firebird-restapi"
LABEL description="Firebird REST API server with CRUD functionality"

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 