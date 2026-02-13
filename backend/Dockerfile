# Build stage
FROM node:20-alpine AS builder

# Install tzdata for timezone support
RUN apk add --no-cache tzdata
ENV TZ=Asia/Seoul

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

# Install tzdata for timezone support
RUN apk add --no-cache tzdata
ENV TZ=Asia/Seoul

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
