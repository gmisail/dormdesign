# First compile Go server
FROM golang:alpine AS build

WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /bin/server .

# Now actually run the server (seperated from build since source files are not needed at runtime)
FROM scratch

# Copy compiled executable over from build
COPY --from=build /bin/server /bin/server

ENTRYPOINT ["/bin/server"]