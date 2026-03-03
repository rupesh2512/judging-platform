FROM node:20-alpine

RUN adduser -D sandbox
USER sandbox

WORKDIR /home/sandbox

COPY run.sh /run.sh
ENTRYPOINT ["sh", "/run.sh"]