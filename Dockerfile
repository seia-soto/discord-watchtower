FROM node:15.5
LABEL maintainer "seia@outlook.kr"

RUN apt update
RUN apt upgrade
RUN apt install git

WORKDIR /usr/src/app
COPY . .

RUN npm i -g yarn pm2
RUN yarn

EXPOSE 7003

CMD ['pm2-runtime', 'start', 'ecosystem.config.js']
