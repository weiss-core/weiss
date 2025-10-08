FROM weiss-base-env AS source_fetch

ARG GIT_REPO=https://github.com/AndreFavotto/weiss.git
ARG APP_VERSION=main

RUN git clone ${GIT_REPO} /app && \
    cd /app && \
    git checkout ${APP_VERSION}

FROM weiss-base-env AS demoioc

WORKDIR /app/examples/exampleIOC

COPY --from=source_fetch /app/examples/exampleIOC /app/examples/exampleIOC

RUN echo -n "EPICS_BASE=${EPICS_BASE}" > configure/RELEASE.local && \
    make

WORKDIR /app/examples/exampleIOC/iocBoot/iocexample

ENTRYPOINT [ "./st.cmd" ]
