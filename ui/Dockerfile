FROM node:16.13.1 as build

WORKDIR /app

COPY package.json ./
RUN yarn

COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json .

RUN yarn build --production

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
