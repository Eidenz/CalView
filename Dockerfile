# Use an official Node.js runtime as a parent image
FROM node:14 as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Pass build-time variables
ARG REACT_APP_RADICALE_USERNAME
ARG REACT_APP_RADICALE_PASSWORD
ARG REACT_APP_RADICALE_URL

# Build the React app
RUN REACT_APP_RADICALE_USERNAME=$REACT_APP_RADICALE_USERNAME \
    REACT_APP_RADICALE_PASSWORD=$REACT_APP_RADICALE_PASSWORD \
    REACT_APP_RADICALE_URL=$REACT_APP_RADICALE_URL \
    npm run build

# Use an official Nginx image to serve the static files
FROM nginx:alpine

# Copy the build output to the Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]