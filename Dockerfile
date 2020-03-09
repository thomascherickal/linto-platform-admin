FROM node:latest
# Gettext for envsubst being called form entrypoint script
RUN apt-get update -y && \
    apt-get install gettext -y && \
    apt-get install -y mongodb
# Why mongodb here ?

COPY ./vue_app /usr/src/app/linto-admin/vue_app
COPY ./webserver /usr/src/app/linto-admin/webserver
COPY ./docker-entrypoint.sh /

WORKDIR /usr/src/app/linto-admin/webserver
HEALTHCHECK CMD node docker-healthcheck.js || exit 1

# @TODO
# Remove ESLint errors for webpack
# Check details for npm packages / fix things up / isolate properly dev and production deps
# Clean docker-compose as a minimal example of running app with docker-compose --> use satck in production
# Clean .envdefault as a minimal example of running app outside docker

# @TODO Always run on 80. Remove HTTP_PORT
EXPOSE 80
# Entrypoint handles the passed arguments
ENTRYPOINT ["/docker-entrypoint.sh"]
# CMD ["npm", "run", "start"]