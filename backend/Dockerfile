FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production=false

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/app.js"]
