FROM node:12 as base

WORKDIR /shapez.io

COPY . .

EXPOSE 3005
EXPOSE 3001

RUN apt-get update \
    && apt-get update \
    && apt-get upgrade -y \
    && apt-get dist-upgrade -y \
    && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/* 

FROM base as shape_base

WORKDIR /shapez.io

RUN yarn

WORKDIR /shapez.io/gulp

RUN yarn

WORKDIR /shapez.io/gulp

ENTRYPOINT ["yarn", "gulp"]
