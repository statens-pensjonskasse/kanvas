FROM old-dockerhub.spk.no:5000/node/14-alpine as builder

RUN mkdir -p /app
WORKDIR /app

# Bygg
COPY --chown=node:node package.json .
RUN npm install

COPY --chown=node:node . .
RUN npm run build

FROM old-dockerhub.spk.no:5000/node/14-alpine

LABEL "no.spk.team"="sterope" \
    "no.spk.team.email"="ITO-TeamSterope@spk.no" \
    "no.spk.app"="kanvas" \
    "no.spk.applikasjon"="kanvas" \
    "no.spk.applikasjonsgruppe"="felles" \
    "no.spk.prosess"="pop" \
    "no.spk.type"="spkapps" \
    "no.spk.system"="kanvas"

# Set the time zone and install curl and tini.
ENV TZ=Europe/Oslo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apk add --no-cache curl && apk add --no-cache tini
RUN npm install express

USER node

# Setter ENV-variable som settes på hvert logginnslag.
ENV NAME="kanvas" \
    PROSESS="pop" \
    APPLIKASJONSGRUPPE="felles" \
    SYSTEM="kanvas" \
    TEAM="sterope"

WORKDIR /home/node
EXPOSE 5000
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json .
COPY --from=builder /app/server.js .

HEALTHCHECK --start-period=30s --interval=30s --timeout=30s CMD /usr/bin/curl -f localhost:8080/admin/ping || exit 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]