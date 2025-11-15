FROM alpine/git:latest AS source_fetch
ARG GIT_REPO=https://github.com/weiss-core/weiss.git
ARG APP_VERSION=main
RUN git clone ${GIT_REPO} /app && cd /app && git checkout ${APP_VERSION}

# Dev environment
FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=source_fetch /app ./
RUN npm install --global corepack@latest && corepack enable pnpm
RUN pnpm install

CMD pnpm run dev --host
# --------------------------------------------
# Production environment
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=source_fetch /app ./
RUN npm install --global corepack@latest && corepack enable pnpm
RUN pnpm install && pnpm run build

FROM nginx:1.25-alpine AS prod
ARG PROD_PORT
ENV PROD_PORT=${PROD_PORT:-80}
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf.template /etc/nginx/conf.d/default.conf.template
COPY ./nginx/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE ${PROD_PORT}
