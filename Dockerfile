FROM old-dockerhub.spk.no:5000/node/14-alpine

# Setter ENV-variable som settes på hvert logginnslag.
ENV NAME="kanvas" \
    PROSESS="pop" \
    APPLIKASJONSGRUPPE="felles" \
    SYSTEM="kanvas" \
    TEAM="sterope"

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

RUN mkdir -p /app
WORKDIR /app
RUN chown node:node /app

# Bygg
USER node

COPY --chown=node:node package.json .
RUN npm install

COPY --chown=node:node ./ .
RUN npm run build

EXPOSE 8080
HEALTHCHECK --start-period=30s --interval=30s --timeout=30s CMD /usr/bin/curl -f localhost:8080/admin/ping || exit 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "start"]