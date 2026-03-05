# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Use production API URL for Docker build
ARG VITE_API_URL=http://backend:5000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Serve stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config that handles React Router
RUN printf 'server {\n  listen 80;\n  location / {\n    root /usr/share/nginx/html;\n    try_files $uri $uri/ /index.html;\n  }\n  location /api {\n    proxy_pass http://backend:5000;\n    proxy_set_header Host $host;\n  }\n}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
