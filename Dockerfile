ARG PARENT_VERSION=2.2.0-node18.16.0
ARG PORT=3000
ARG PORT_DEBUG=9229
ARG DOT=.

# Development
FROM defradigital/node-development:${PARENT_VERSION} AS development
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}

ARG PORT
ARG PORT_DEBUG
ARG DOT
ENV PORT ${PORT}
EXPOSE ${PORT} ${PORT_DEBUG}

COPY --chown=root:node --chmod=755 package*.json ./
RUN npm ci --ignore-scripts
COPY --chown=root:node --chmod=755 ${DOT} ${DOT}
USER root
RUN npm run build
USER node
CMD [ "npm", "run", "start:watch" ]

# Production
FROM defradigital/node:${PARENT_VERSION} AS production
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node:${PARENT_VERSION}

ARG PORT
ENV PORT ${PORT}
EXPOSE ${PORT}

COPY --from=development /home/node/app/ ./app/
COPY --from=development /home/node/package*.json ./
RUN npm ci --ignore-scripts
CMD [ "node", "app" ]
