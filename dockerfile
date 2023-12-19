# syntax=docker/dockerfile:1
# first stage build the frontend
FROM node:20-alpine3.18 as build

# Set the working directory in the container to /app
WORKDIR /build
# Copy the current directory contents into the container at /app
COPY . .

RUN corepack enable
# Install Node.js dependencies
RUN yarn install
RUN yarn build

FROM alpine:3.18

# Set the working directory in the container to /app
WORKDIR /app

# copy the server directory and dist from previous buildstage into the container at /app
COPY --from=build /build/dist /app/dist
COPY /server /app/server
COPY /wsgi.py /app
COPY /pipRequirements.txt /app
COPY /setup.py /app

# Install python3.11
RUN apk add --update --no-cache python3 py3-pip
# install python dependencies
RUN pip install -r pipRequirements.txt

# Install the server package
RUN pip install -e .

# Make port 5001 available to the server
EXPOSE 5001

# The command that will be executed when the container is run to then be proxied out to the host
CMD ["gunicorn","--workers", "3","--timeout","500","--graceful-timeout", "500", "--bind", "0.0.0.0:5001","wsgi:create_app('/data')"]
