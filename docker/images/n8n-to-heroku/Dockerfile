FROM node:lts-alpine

# Set a custom user to not have n8n run as root
USER root

# Update everything and install needed dependencies
RUN apk add --update graphicsmagick tzdata tini su-exec git

# Specifying work directory
WORKDIR /data

COPY package.json /package.json

COPY docker-entrypoint.sh /docker-entrypoint.sh
# make the script executable
RUN chmod +x /docker-entrypoint.sh

COPY docker-entrypoint.sh /docker-entrypoint.sh
# make the script executable
RUN chmod +x /docker-entrypoint.sh

# define execution entrypoint
CMD ["/docker-entrypoint.sh"]
