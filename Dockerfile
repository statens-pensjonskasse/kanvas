# Bygg
FROM ghcr.io/statens-pensjonskasse/nodejs:24-builder as builder
COPY --chown=app:app package*.json ./
RUN npm install --no-audit

COPY --chown=app:app . .

RUN pwd
RUN npm run build && npm prune --production

# Sett opp runner
FROM ghcr.io/statens-pensjonskasse/nodejs:24

COPY --from=builder /home/app ./

EXPOSE 8080
HEALTHCHECK --start-period=30s --interval=30s --timeout=30s CMD /usr/bin/curl -f localhost:8080/admin/ping || exit 1
CMD ["npm", "--no-update-notifier", "run", "start"]
