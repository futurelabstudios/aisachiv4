# aisachiv4-main/Dockerfile.frontend

# ---- Build Stage ----
# Use a Node.js image to build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Declare build-time arguments that will be passed from docker-compose
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set these ARGs as environment variables so Vite can use them during the build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copy package.json and package-lock.json and install all dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY . .

# Build the application for production
RUN npm run build

# ---- Serve Stage ----
# Use a minimal Node.js image to serve the static files
FROM node:20-alpine

WORKDIR /app

# Copy only the necessary files for production
COPY package.json package-lock.json ./

# Install only production dependencies (this will include 'serve')
RUN npm install --omit=dev

# Copy the built assets from the build stage
COPY --from=build /app/dist ./dist

# Expose the port we defined in the start script (3000)
EXPOSE 3000

# The command to start the server using the script from package.json
CMD [ "npm", "start" ]