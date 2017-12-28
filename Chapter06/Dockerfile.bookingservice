FROM golang:1.9

WORKDIR /go/src/github.com/martin-helmich/cloudnativego-backend
COPY . .
WORKDIR src/bookingservice
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bookingservice

FROM scratch

COPY --from=0 /go/src/github.com/martin-helmich/cloudnativego-backend/src/bookingservice/bookingservice /bookingservice
ENV LISTEN_URL=0.0.0.0:8181
EXPOSE 8181
CMD ["/bookingservice"]
