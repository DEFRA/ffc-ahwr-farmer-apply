ARG PARENT_VERSION=1.2.16-node16.14.2
ARG PORT_DEBUG=9229
ARG DOT=.

# Development
FROM defradigital/node-development:${PARENT_VERSION}
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}
ARG PORT_DEBUG
ARG DOT
EXPOSE ${PORT_DEBUG}

USER node

COPY --chown=root:node --chmod=755 package*.json ./
RUN npm ci --ignore-scripts
COPY --chown=root:node --chmod=755 ${DOT} ${DOT}
CMD [ "npm", "run", "test" ]
