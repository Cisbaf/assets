FROM node:latest

WORKDIR /app

COPY . .

RUN npm install -y

CMD [ "node", "app.js" ]