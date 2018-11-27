FROM node:6.10.0

MAINTAINER nagaa052

ENV HOME=/home/app
ENV BOT_PATH=$HOME/bot

WORKDIR $BOT_PATH
COPY package.json yarn.lock $BOT_PATH/
RUN yarn install

COPY Procfile $BOT_PATH/
COPY src $BOT_PATH/src
ENTRYPOINT node src/index.js
