FROM node:9.4-alpine
# Two separate copies for caching
COPY package.json /tmp/package.json
RUN cd /tmp && npm i
RUN mkdir -p /usr/src/codebottle && cp -a /tmp/node_modules /usr/src/codebottle/node_modules
COPY . /usr/src/codebottle
RUN cd /usr/src/codebottle && \
	npm run assets:prod
WORKDIR /usr/src/codebottle
ENTRYPOINT [ "node", "index.js" ]
