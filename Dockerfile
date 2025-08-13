# Use nginx to serve static files
FROM nginx:alpine

# Copy all files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY editor.html /usr/share/nginx/html/
COPY help.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# Create nginx configuration for proper MIME types
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location ~* \.(js)$ { \
        add_header Content-Type application/javascript; \
    } \
    \
    location ~* \.(css)$ { \
        add_header Content-Type text/css; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]