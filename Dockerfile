FROM oven/bun:1 as base
WORKDIR /usr/src/app

RUN apt install bash

COPY --chown=bun:bun .docker/entrypoint.sh /etc/entrypoint.sh
RUN ["chmod", "+x", "/etc/entrypoint.sh"]

ENTRYPOINT ["/etc/entrypoint.sh"]

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/
RUN cd /temp/ && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM install AS prerelease
COPY --from=install /temp/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun test
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/node_modules node_modules
COPY --from=prerelease /usr/src/app/dist/ ./dist/
COPY --from=prerelease /usr/src/app/package.json .
COPY src /usr/src/app/src/

# run the app
USER bun
