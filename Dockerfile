# Use Node.js 18 slim as parent image
FROM node:18-slim

# Create and define the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Delete the local .env file inside the container to force using Environment Variables from Easypanel
RUN rm -f .env

# Command to run the application
CMD [ "npm", "start" ]
