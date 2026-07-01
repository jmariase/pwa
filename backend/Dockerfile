FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package specifications
COPY package.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy application source code
COPY server.js ./

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose server port
EXPOSE 5000

CMD ["node", "server.js"]
