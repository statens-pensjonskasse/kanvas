# Bygg
FROM cr.spk.no/base/node:22-builder as builder

COPY --chown=app:app package*.json ./
RUN npm install --no-audit

COPY --chown=app:app . .

RUN pwd
RUN npm run build && npm prune --production

# Sett opp runner
FROM cr.spk.no/base/node:22-runner

USER node

COPY --from=builder "${BUILD_DIR}" ./

EXPOSE 8080
HEALTHCHECK --start-period=30s --interval=30s --timeout=30s CMD /usr/bin/curl -f localhost:8080/admin/ping || exit 1
CMD ["npm", "--no-update-notifier", "run", "start"]
