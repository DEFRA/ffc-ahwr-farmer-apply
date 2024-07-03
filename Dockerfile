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
COPY --chown=root:node --chmod=775 ${DOT} ${DOT}
RUN npm run build
CMD [ "npm", "run", "start:watch" ]

# Production
FROM defradigital/node:${PARENT_VERSION} AS production
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node:${PARENT_VERSION}

ARG PORT
ENV PORT ${PORT}
EXPOSE ${PORT}

<<<<<<< HEAD
USER node
COPY --from=development /home/node/app/app/ ./app/
COPY --from=development /home/node/app/package*.json ./
=======
COPY --from=development /home/node/app/ ./app/
COPY --from=development /home/node/package*.json ./
>>>>>>> ce86e45a1ecff59b8b0178027509081253c8d467
RUN npm ci --ignore-scripts
CMD [ "node", "app" ]
