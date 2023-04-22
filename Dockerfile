FROM node:16.20-alpine

ENV USER=akashibot

# install python and make
RUN apk update

# create evobot user
RUN set -x && \
    addgroup -g 101 -S ${USER} && \
	adduser -S -D -H -u 101 -h /home/akashibot -s /sbin/nologin -G ${USER} -g ${USER} ${USER}

# set up volume and user
USER ${USER}
WORKDIR /home/akashibot

COPY --chown=${USER}:${USER} package*.json ./
RUN npm install
VOLUME [ "/home/akashibot" ]

COPY --chown=${USER}:${USER}  . .

COPY --chown=${USER}:${USER} .docker/entrypoint.sh /etc/entrypoint.sh
RUN ["chmod", "+x", "/etc/entrypoint.sh"]

ENTRYPOINT ["/etc/entrypoint.sh"]
