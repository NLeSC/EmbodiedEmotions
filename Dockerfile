FROM node:slim

RUN useradd -ms /bin/bash node
ADD . /home/node/app
RUN chown -R node:node /home/node

RUN npm install -g bower grunt-cli node-gyp

USER node
ENV HOME /home/node

EXPOSE 9000

ADD . /app
WORKDIR /home/node/app

RUN npm install
RUN bower install

CMD grunt serve
