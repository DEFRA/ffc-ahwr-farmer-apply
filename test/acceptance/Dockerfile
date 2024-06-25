ARG PARENT_VERSION=1.2.16-node16.14.2
ARG PORT_DEBUG=9229

# Development
FROM defradigital/node-development:${PARENT_VERSION}
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}
ARG PORT_DEBUG
EXPOSE ${PORT_DEBUG}

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package*.json ./
USER node
RUN npm ci --ignore-scripts
COPY --chown=node:node . .
CMD [ "npm", "run", "test" ]