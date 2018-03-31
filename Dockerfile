FROM node:8

COPY package.json /app/package.json

WORKDIR /app
RUN yarn

COPY . /app
EXPOSE 2222
CMD ["node", "src/index.js"]