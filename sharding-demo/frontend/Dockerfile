FROM node:18-slim
WORKDIR /app

RUN corepack disable

RUN npm uninstall -g yarn || true
RUN npm install -g yarn@1.22.22

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

EXPOSE 5173
CMD ["yarn", "dev", "--host"]
