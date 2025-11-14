FROM debian:11-slim AS epicsbuilder

ENV EPICS_VERSION=7.0.9
ENV EPICS_BASE=/epics/base

WORKDIR /epics

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    wget autoconf libtool check patch \
    build-essential libreadline-dev re2c libxml2-dev && \
    rm -rf /var/lib/apt/lists/*

RUN wget --no-check-certificate https://epics-controls.org/download/base/base-${EPICS_VERSION}.tar.gz && \
    tar -xvf base-${EPICS_VERSION}.tar.gz && \ 
    rm -rf base-${EPICS_VERSION}.tar.gz && \
    ln -s /epics/base-${EPICS_VERSION} /epics/base && \ 
    cd /epics/base && \
    make -j $(nproc)

FROM debian:11-slim AS demoioc

WORKDIR /epics

COPY --from=epicsbuilder /epics /epics

ENV EPICS_VERSION=7.0.9
ENV EPICS_BASE=/epics/base
ENV EPICS_HOST_ARCH=linux-x86_64
ENV PATH=${EPICS_BASE}/bin/${EPICS_HOST_ARCH}:${PATH}

WORKDIR /app/examples/exampleIOC

COPY . /app/examples/exampleIOC

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential libreadline-dev
  
RUN echo -n "EPICS_BASE=${EPICS_BASE}" > configure/RELEASE.local && \
    make

WORKDIR /app/examples/exampleIOC/iocBoot/iocexample

ENTRYPOINT [ "./st.cmd" ]
