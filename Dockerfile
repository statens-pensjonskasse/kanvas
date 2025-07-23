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

ENV PORT="8080"
EXPOSE 8080
CMD ["npm", "--no-update-notifier", "run", "start"]
