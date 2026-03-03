# FROM alpine:3.18

# RUN apk add --no-cache g++

# RUN adduser -D sandbox
# USER sandbox

# WORKDIR /home/sandbox

# COPY run.sh /run.sh
# ENTRYPOINT ["sh", "/run.sh"]

FROM alpine:3.18

RUN apk add --no-cache g++ dos2unix

RUN adduser -D -u 1000 sandbox

COPY run.sh /run.sh
RUN dos2unix /run.sh && chmod +x /run.sh

USER sandbox
WORKDIR /home/sandbox

ENTRYPOINT ["sh", "/run.sh"]