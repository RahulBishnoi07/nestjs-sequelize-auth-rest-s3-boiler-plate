# Use the official Node.js image as the base image
FROM node:23.0.0

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Nest.js application
RUN npm run build

# Start the application
CMD ["npm", "run", "start:prod"]
