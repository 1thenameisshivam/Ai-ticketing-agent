FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm install -g pm2 

COPY . .

EXPOSE 3000

CMD ["pm2-runtime", "src/index.js"]