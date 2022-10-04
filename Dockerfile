FROM node 

WORKDIR /doc_container/app

# ARG NODE_ENV=production
COPY ./package*.json ./
RUN npm install
COPY . .

CMD [ "npm", "start"]