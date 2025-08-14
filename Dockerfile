# Use uma versão específica para evitar builds quebrados no futuro
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install -y

CMD [ "node", "app.js" ]