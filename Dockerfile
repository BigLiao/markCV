FROM node:12.10.0

ENV MARKCV_ENV="docker"

WORKDIR /markCV

COPY . /markCV

RUN npm install

CMD bash
