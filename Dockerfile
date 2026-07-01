FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets to Nginx html directory
COPY index.html /usr/share/nginx/html/
COPY index.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY utils.js /usr/share/nginx/html/
COPY sw.js /usr/share/nginx/html/
COPY manifest.json /usr/share/nginx/html/
COPY icons /usr/share/nginx/html/icons

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
