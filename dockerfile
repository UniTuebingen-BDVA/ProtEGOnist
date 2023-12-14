# Start from a base image with miniconda3 installed
FROM continuumio/miniconda3

# Install Node.js
RUN apt-get update && \
  apt-get install -y ca-certificates curl gnupg && \
  mkdir -p /etc/apt/keyrings && \
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
  NODE_MAJOR=20 && \
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
  apt-get update && apt-get install -y nodejs
RUN corepack enable

# Set the working directory in the container to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# Create a conda environment using requirements.yml
# This file should define the conda environment and include all the Python dependencies
RUN conda env create -f requirements.yml

# Make sure the environment is activated:
ENV PATH /opt/conda/envs/protEGOnist/bin:$PATH
RUN /bin/bash -c "source activate protEGOnist"

# Install the server package
RUN pip install -e .

# Install Node.js dependencies
RUN yarn build

# Make port 5000 available to the world outside this container
EXPOSE 5000

# The command that will be executed when the container is run
CMD ["gunicorn","--workers", "3","--graceful-timeout", "500" "--bind", "0.0.0.0:5000","wsgi:protegonist"]
