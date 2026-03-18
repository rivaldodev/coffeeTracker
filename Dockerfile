# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Use /api as the API URL - Nginx will proxy it to the backend
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Backend URL that Nginx will proxy /api requests to
ARG BACKEND_URL=https://coffee.rivs.com.br
ENV BACKEND_URL=$BACKEND_URL

RUN npm run build

# Production stage
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config: SPA routing + API proxy
ARG BACKEND_URL=https://coffee.rivs.com.br
RUN printf "server {\n\
  listen 80;\n\
\n\
  location /api/ {\n\
    proxy_pass ${BACKEND_URL}/;\n\
    proxy_set_header Host \$host;\n\
    proxy_set_header X-Real-IP \$remote_addr;\n\
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n\
    proxy_set_header X-Forwarded-Proto \$scheme;\n\
  }\n\
\n\
  location / {\n\
    root /usr/share/nginx/html;\n\
    index index.html index.htm;\n\
    try_files \$uri \$uri/ /index.html;\n\
  }\n\
}\n" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
