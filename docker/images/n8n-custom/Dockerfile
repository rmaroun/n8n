# 1. Create an image to build n8n
FROM node:14.15-alpine as builder

# Update everything and install needed dependencies
USER root

# Install all needed dependencies
RUN apk --update add --virtual build-dependencies python build-base ca-certificates && \
	npm_config_user=root npm install -g lerna

WORKDIR /data

# We check if the file exists in the current root path
RUN if [ test -f "lerna.json" ] ; then COPY lerna.json . ; else COPY ../../../lerna.json . ; fi
#COPY lerna.json .
RUN if [ test -f "package.json" ] ; then COPY package.json . ; else COPY ../../../package.json . ; fi
#COPY package.json .
RUN if [ test -d "packages/cli/" ] ; then COPY packages/cli/ ./packages/cli/ ; else COPY ../../../packages/cli/ ./packages/cli/ ; fi
#COPY packages/cli/ ./packages/cli/
RUN if [ test -d "packages/core/" ] ; then COPY packages/core/ ./packages/core/ ; else COPY ../../../packages/core/ ./packages/core/ ; fi
#COPY packages/core/ ./packages/core/
RUN if [ test -d "packages/design-system/" ] ; then COPY packages/design-system/ ./packages/design-system/ ; else COPY ../../../packages/design-system/ ./packages/design-system/ ; fi
#COPY packages/design-system/ ./packages/design-system/
RUN if [ test -d "packages/editor-ui/" ] ; then COPY packages/editor-ui/ ./packages/editor-ui/ ; else COPY ../../../packages/editor-ui/ ./packages/editor-ui/ ; fi
#COPY packages/editor-ui/ ./packages/editor-ui/
RUN if [ test -d "packages/nodes-base/" ] ; then COPY packages/nodes-base/ ./packages/nodes-base/ ; else COPY ../../../packages/nodes-base/ ./packages/nodes-base/ ; fi
#COPY packages/nodes-base/ ./packages/nodes-base/
RUN if [ test -d "packages/workflow/" ] ; then COPY packages/workflow/ ./packages/workflow/ ; else COPY ../../../packages/workflow/ ./packages/workflow/ ; fi
#COPY packages/workflow/ ./packages/workflow/
RUN rm -rf node_modules packages/*/node_modules packages/*/dist

RUN npm install --production --loglevel notice
RUN lerna bootstrap --hoist -- --production
RUN npm run build


# 2. Start with a new clean image with just the code that is needed to run n8n
FROM node:14.15-alpine

USER root

RUN apk add --update graphicsmagick tzdata tini su-exec git

WORKDIR /data

# Install all needed dependencies
RUN npm_config_user=root npm install -g full-icu

# Install fonts
RUN apk --no-cache add --virtual fonts msttcorefonts-installer fontconfig && \
	update-ms-fonts && \
	fc-cache -f && \
	apk del fonts && \
	find  /usr/share/fonts/truetype/msttcorefonts/ -type l -exec unlink {} \;

ENV NODE_ICU_DATA /usr/local/lib/node_modules/full-icu

COPY --from=builder /data ./

COPY docker/images/n8n-custom/docker-entrypoint.sh /docker-entrypoint.sh
# make the script executable
RUN chmod +x /docker-entrypoint.sh

# define execution entrypoint
CMD ["/docker-entrypoint.sh"]
#ENTRYPOINT ["tini", "--", "/docker-entrypoint.sh"]

EXPOSE 5678/tcp
