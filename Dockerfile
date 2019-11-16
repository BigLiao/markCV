FROM node:12

ENV MARKCV_ENV="docker"

WORKDIR /markCV

COPY . /markCV

RUN mkdir /markCV/app

VOLUME /markCV/app

RUN npm install
# --registry=https://registry.npm.taobao.org

CMD bash
