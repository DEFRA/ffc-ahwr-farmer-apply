ARG PARENT_VERSION=2.2.0-node18.16.0
ARG PORT=3000
ARG PORT_DEBUG=9229

# Development
FROM defradigital/node-development:${PARENT_VERSION} AS development
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}

ARG PORT
ARG PORT_DEBUG
ENV PORT ${PORT}
EXPOSE ${PORT} ${PORT_DEBUG}

USER node
RUN mkdir -p /home/node/app 
WORKDIR /home/node/app

COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build
CMD [ "npm", "run", "start:watch" ]

# Production
FROM defradigital/node:${PARENT_VERSION} AS production
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node:${PARENT_VERSION}

ARG PORT
ENV PORT ${PORT}
EXPOSE ${PORT}

USER node
COPY --from=development /home/node/app/app/ ./app/
COPY --from=development /home/node/app/package*.json ./
RUN npm ci --ignore-scripts
CMD [ "node", "app" ]
