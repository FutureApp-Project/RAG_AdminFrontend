FROM cgr.dev/chainguard/node:latest-dev AS build

USER root

WORKDIR /app

ARG VITE_BASE_URL=http://localhost:8000
ARG VITE_ALARM_HUB=http://localhost:8000/AlarmHub
ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_ALARM_HUB=${VITE_ALARM_HUB}

COPY --chown=node:node package*.json ./
USER node
RUN npm ci

COPY --chown=node:node . .
RUN npm run build

FROM cgr.dev/chainguard/nginx:latest

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080