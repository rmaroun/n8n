FROM node:lts-alpine

# pass N8N_VERSION Argument while building or use default
ARG N8N_VERSION=0.164.11

# Set a custom user to not have n8n run as root
USER root

# Update everything and install needed dependencies
RUN apk add --update graphicsmagick tzdata tini su-exec git

# Specifying work directory
WORKDIR /data

# Install all needed dependencies
RUN npm_config_user=root npm install -g full-icu

# Install n8n and the also temporary all the packages
# it needs to build it correctly.
RUN apk --update add --virtual build-dependencies python3 build-base && \
	npm_config_user=root npm install -g n8n@npm:@rmaroun/n8n@${N8N_VERSION} && \
	apk del build-dependencies

# Install fonts
RUN apk --no-cache add --virtual fonts msttcorefonts-installer fontconfig && \
	update-ms-fonts && \
	fc-cache -f && \
	apk del fonts && \
	find  /usr/share/fonts/truetype/msttcorefonts/ -type l -exec unlink {} \;

ENV NODE_ICU_DATA /usr/local/lib/node_modules/full-icu

COPY docker/images/n8n-to-heroku/docker-entrypoint.sh /docker-entrypoint.sh
# make the script executable
RUN chmod +x /docker-entrypoint.sh

# define execution entrypoint
CMD ["/docker-entrypoint.sh"]
