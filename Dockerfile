FROM node:18-alpine
ENV NODE_ENV=development
WORKDIR /job
COPY package*.json ./
COPY tsconfig.json ./
COPY . .
RUN npm ci
RUN npx prisma generate
RUN npm run build
CMD ["npm" , "run", "start:prod"]