FROM node:10-alpine
# Because bcrypt
RUN apk --no-cache add --virtual builds-deps build-base python git openssh
# Two separate copies for caching
COPY package.json /tmp/package.json
RUN cd /tmp && npm i
# Because alpine uses musl which isn't compatible with pre-built binaries
RUN cd /tmp && npm rebuild bcrypt --build-from-source
RUN mkdir -p /usr/src/codebottle && cp -a /tmp/node_modules /usr/src/codebottle/node_modules
COPY . /usr/src/codebottle
RUN cd /usr/src/codebottle && \
	npm run webapp:prod
WORKDIR /usr/src/codebottle
ENTRYPOINT [ "node", "index.js" ]
