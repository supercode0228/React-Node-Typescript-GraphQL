FROM alpine

WORKDIR /usr/src/app
RUN apk update && apk add nodejs npm yarn chromium chromium-chromedriver

COPY ./package.json .
COPY ./yarn.lock .
RUN yarn install

COPY . .
RUN yarn build

EXPOSE 3000

CMD [ "yarn", "start" ]
