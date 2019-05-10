FROM node:8.11.1

WORKDIR /usr/src/scheduler-api

COPY ./ ./

RUN npm install --save-dev nodemon

RUN npm install

CMD ["/bin/bash"]