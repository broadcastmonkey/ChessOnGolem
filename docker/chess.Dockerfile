FROM node:12-alpine

VOLUME /golem/work /golem/output /golem/resources /golem/code

WORKDIR /golem/work


RUN chmod -R 777 /golem/work

RUN mkdir /golem/code2
ADD ./chess_engine /golem/code2/chess_engine
ADD ./input.txt /golem/code2/input.txt
RUN chmod -R 777 /golem/code2
RUN chmod -R 777 /golem/work