FROM node:16 AS build-env
ADD . /app
WORKDIR /app
RUN npm install --omit=dev

FROM gcr.io/distroless/nodejs16-debian11
COPY --from=build-env /app /app
WORKDIR /app
EXPOSE 3000
CMD ["index.js"]