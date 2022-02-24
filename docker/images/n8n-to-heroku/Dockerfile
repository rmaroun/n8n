FROM node:lts-alpine

# pass N8N_VERSION Argument while building or use default
ARG N8N_VERSION=0.164.11

# Update everything and install needed dependencies
RUN apk add --update graphicsmagick tzdata

# Set a custom user to not have n8n run as root
USER root

# Install n8n and the also temporary all the packages
# it needs to build it correctly.
RUN apk --update add --virtual build-dependencies python3 build-base && \
	npm_config_user=root npm install -g @rmaroun/n8n@${N8N_VERSION} && \
	npm install -g run-script-os && npm install -g @oclif/command && \
	apk del build-dependencies

# Specifying work directory
WORKDIR /data

COPY docker-entrypoint.sh /docker-entrypoint.sh
# make the script executable
RUN chmod +x /docker-entrypoint.sh

# define execution entrypoint
CMD ["/docker-entrypoint.sh"]
