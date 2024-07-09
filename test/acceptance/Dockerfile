ARG PARENT_VERSION=1.2.16-node16.14.2
ARG PORT_DEBUG=9229
ARG SOURCE=.

# Development
FROM defradigital/node-development:${PARENT_VERSION}
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}
ARG PORT_DEBUG
ARG SOURCE
EXPOSE ${PORT_DEBUG}

USER node

COPY --chown=root:node --chmod=755 package*.json ./
RUN npm ci --ignore-scripts
COPY --chown=root:node --chmod=755 ./.git ./
COPY --chown=root:node --chmod=755 ./.github ./
COPY --chown=root:node --chmod=755 ./Jenkinsfile ./
COPY --chown=root:node --chmod=755 ./app ./app
COPY --chown=root:node --chmod=755 ./jest.config.js ./
COPY --chown=root:node --chmod=755 ./webpack.config.js ./
COPY --chown=root:node --chmod=755 ./sonar-project.properties ./
COPY --chown=root:node --chmod=755 ./provision.azure.yaml ./
COPY --chown=root:node --chmod=755 ./scripts ./scripts
COPY --chown=root:node --chmod=755 ./test ./test
COPY --chown=root:node --chmod=755 ./zap ./zap
CMD [ "npm", "run", "test" ]
