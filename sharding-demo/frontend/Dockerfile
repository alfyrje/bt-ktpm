FROM node:18-slim
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && corepack prepare yarn@stable --activate
RUN yarn install --frozen-lockfile
COPY . .
CMD ["yarn","dev","--host"]
