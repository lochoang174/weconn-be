FROM node:alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build payment

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production --legacy-peer-deps

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/payment/main"]