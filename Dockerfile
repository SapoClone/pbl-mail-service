##################
# BUILD BASE IMAGE
##################

FROM node:20-alpine AS base

# Install and use the pnpm version pinned in package.json's "packageManager" field
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

#############################
# BUILD FOR LOCAL DEVELOPMENT
#############################

FROM base AS development
WORKDIR /app
RUN chown -R node:node /app

COPY --chown=node:node package*.json pnpm-lock.yaml ./
RUN pnpm install
COPY --chown=node:node . .

USER node

#####################
# BUILD BUILDER IMAGE
#####################

FROM base AS builder
WORKDIR /app

COPY --chown=node:node package*.json pnpm-lock.yaml ./
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node --from=development /app/src ./src
COPY --chown=node:node --from=development /app/tsconfig.json ./tsconfig.json
COPY --chown=node:node --from=development /app/tsconfig.build.json ./tsconfig.build.json
COPY --chown=node:node --from=development /app/nest-cli.json ./nest-cli.json

RUN pnpm build

ENV NODE_ENV production
RUN pnpm prune --prod
RUN pnpm install --prod

USER node

######################
# BUILD FOR PRODUCTION
######################
# AWS Lambda container image — deployed as a container-image-package Lambda
# function, triggered directly by an SQS event source mapping (see
# pbl-infra). The base image provides the Lambda Runtime Interface Client;
# CMD names the handler as "<compiled file without .js>.<exported function>".

FROM public.ecr.aws/lambda/nodejs:20 AS production

RUN mkdir -p ${LAMBDA_TASK_ROOT}/dist/mail/templates
COPY --from=builder /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules
COPY --from=builder /app/dist ${LAMBDA_TASK_ROOT}/dist
COPY --from=builder /app/package.json ${LAMBDA_TASK_ROOT}/package.json

CMD [ "dist/lambda.handler" ]
