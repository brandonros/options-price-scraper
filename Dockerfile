FROM node:alpine
# Create app directory
WORKDIR /app
# Install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --production
# Bundle app source
COPY . .
# Switch to non-root user
USER node
# Export command
CMD [ "node", index.js" ]
