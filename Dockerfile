FROM node:15 as developer

RUN apt-get -yq update && \
apt-get -yqq install \
libzip-dev git ssh zip

RUN mkdir -p ~/.ssh && ssh-keyscan -H github.com >>~/.ssh/known_hosts

WORKDIR /usr/src/app

ENV PATH="/usr/src/app/node_modules/.bin:$PATH"

ENTRYPOINT ["make"]
CMD ["start"]

FROM developer as builder
CMD ["build"]
