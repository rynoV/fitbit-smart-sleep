FROM arm32v7/node:10.16.3 AS development

ARG UID=1000
ARG GID=1000
# First line in run is used to align the node UID with the host's. Basically
# changes the UID and GID of node to match the host's UID and GID so that npm
# has the right permissions to do its thing. The args UID and GID default to
# 1000 and can be configured through the docker-compose.yml for each user.
# Linux work around from:
# https://jdlm.info/articles/2019/09/06/lessons-building-node-app-docker.html#appendix-dealing-with-uid-mismatches-on-linux
# The second line creates the working directory and makes sure that it's owned
# by the node user. Note that a lot of commands are chained together and are run
# in one RUN command. This saves layers and therefore disk space and download
# time.
RUN \
  usermod --uid ${UID} node && groupmod --gid ${GID} node &&\
  mkdir /srv/smart-sleep && chown node:node /srv/smart-sleep

# Run subsequent build steps and the process in the container as the node user,
# an unprivileged user which comes built into the node image. Without this they
# would run as root which is bad practice.
USER node

# Set the working directory for subsequent commands and containers created from
# the image
WORKDIR /srv/smart-sleep

# Copies the npm packaging files to the WORKDIR that we set up above. The
# trailing / tells Docker that the destination is a folder. The reason for
# copying in only the packaging files, rather than the whole application folder,
# is that Docker will cache the results of the npm install step below and rerun
# it only if the packaging files change. If we copied in all our source files,
# changing any one would bust the cache even though the required packages had
# not changed, leading to unnecessary npm installs in subsequent builds.  The
# --chown=node:node flag for COPY ensures that the files are owned by the
# unprivileged node user rather than root, which is the default
COPY --chown=node:node package.json package-lock.json ./

# Uncomment the following if bootstrapping and no packages are installed
# RUN mkdir -p node_modules

# Runs as the node user to install the dependencies in the working directory.
RUN npm install --quiet

# Use slim node for prod because it only includes the system dependencies needed
# to run a node app and not the dependencies needed to build one
FROM arm32v7/node:10.16.3-slim AS production

# USER and WORKDIR don't persist into the second stage automatically.
USER node
WORKDIR /srv/smart-sleep

# Copies the dependencies installed in the preceding development stage into the
# production stage and makes them owned by root, so the node user can read but
# not write them.
COPY --from=development --chown=root:root /srv/smart-sleep/node_modules ./node_modules

# copies the rest of the application files from the host to the working
# directory in the container
COPY . .

# Specifies the command to run. In the development stage, the application files
# came from bind mounts set up with docker-compose, so it made sense to specify
# the command in the docker-compose.yml file instead of the Dockerfile. Here it
# makes more sense to specify the command in the Dockerfile, which builds it
# into the container.
CMD ["node", "index.js"]
