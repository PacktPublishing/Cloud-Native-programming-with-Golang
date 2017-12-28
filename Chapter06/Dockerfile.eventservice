FROM golang:1.9

WORKDIR /go/src/github.com/martin-helmich/cloudnativego-backend
COPY . .
WORKDIR src/eventservice
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o eventservice

FROM scratch

COPY --from=0 /go/src/github.com/martin-helmich/cloudnativego-backend/src/eventservice/eventservice /eventservice
ENV LISTEN_URL=0.0.0.0:8181
EXPOSE 8181
CMD ["/eventservice"]
