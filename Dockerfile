FROM node:8.7-alpine

WORKDIR /home/app

ADD app/package.json /home/app
RUN npm install
ADD app /home/app

CMD ["npm", "start"]

EXPOSE 3000
