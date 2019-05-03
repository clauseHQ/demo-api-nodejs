#!/usr/bin/env bash
docker build -t clause-api-sample .
docker run -p 5000:5000 -it clause-api-sample
