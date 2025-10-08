FROM python:3.12.7 AS builder

ENV EPICS_VERSION=7.0.8
ENV EPICS_BASE=/epics/base

WORKDIR /epics

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget autoconf libtool check patch \
    build-essential libreadline-dev re2c libxml2-dev && \
    rm -rf /var/lib/apt/lists/*

RUN wget https://epics-controls.org/download/base/base-${EPICS_VERSION}.tar.gz && \
    tar -xvf base-${EPICS_VERSION}.tar.gz && \ 
    rm -rf base-${EPICS_VERSION}.tar.gz && \
    ln -s /epics/base-${EPICS_VERSION} /epics/base && \ 
    cd /epics/base && \
    make -j $(nproc)

# use clean env
FROM python:3.12.7 AS weiss-base-env

ENV EPICS_VERSION=7.0.8 \
    EPICS_BASE=/epics/base

WORKDIR /epics

COPY --from=builder /epics /epics
