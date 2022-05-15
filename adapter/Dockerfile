FROM python:3.10-slim-bullseye

# Install dependencies
# moviepy is installed separately because it downloads a big binary file
WORKDIR /tmp/install
RUN pip install moviepy==1.0.3
COPY requirements.txt setup.py ./
RUN pip install -r requirements.txt

# Install app module
COPY config/ config/
COPY daemon/ daemon/
COPY watcher/ watcher/
COPY cleaner/ cleaner/
COPY scraper/ scraper/
RUN python setup.py install

# Cleanup
RUN rm -rf /tmp/install

WORKDIR /app
