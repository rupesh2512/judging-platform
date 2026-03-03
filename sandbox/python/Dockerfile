FROM python:3.11-alpine

# Create a non-root user for safety
RUN adduser -D sandbox
USER sandbox

WORKDIR /home/sandbox

# Entrypoint: run.sh receives the filename as $1
COPY run.sh /run.sh
ENTRYPOINT ["sh", "/run.sh"]