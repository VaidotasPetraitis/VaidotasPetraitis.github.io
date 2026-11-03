# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS frontend
WORKDIR /src/web
COPY web/package.json web/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY web/ ./
COPY internal/data/*.json /src/internal/data/
RUN npm run check && npm test && npm run build

FROM golang:1.26.10-bookworm AS backend
WORKDIR /src
COPY go.mod ./
COPY main.go main_test.go ./
COPY internal/ ./internal/
COPY web/embed.go web/embed_test.go ./web/
COPY --from=frontend /src/web/dist ./web/dist
RUN go test . ./internal/... ./web && go vet . ./internal/... ./web
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/portfolio .

FROM scratch AS runtime
COPY --from=backend /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=backend /out/portfolio /portfolio
USER 65532:65532
ENV PORTFOLIO_ADDR=0.0.0.0:8080
EXPOSE 8080
ENTRYPOINT ["/portfolio"]
