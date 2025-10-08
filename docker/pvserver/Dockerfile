FROM weiss-base-env AS pvserver

RUN apt-get update && apt-get install -y  \
    libldap2-dev libsasl2-dev ldap-utils tox \
    lcov valgrind
COPY ./submodules/React-Automation-Studio/pvServer/pyproject.toml .

RUN pip install --upgrade pip && pip --no-cache-dir install poetry==2.0.1
RUN poetry config virtualenvs.create false
RUN poetry install --no-root
WORKDIR /pvServer

ADD ./submodules/React-Automation-Studio/pvServer /pvServer
WORKDIR /pvServer
ENV pvServerURL=http://127.0.0.1
ENV pvServerPort=5000
ENV pvServerNameSpace=pvServer
ENV VITE_EnableLogin=false
ENV VITE_DisableStandardLogin=false
ENV VITE_EnableActiveDirectoryLogin=false
ENV VITE_EnableGoogleLogin=false
ENV EPICS_CA_ADDR_LIST="localhost"
ENV PYEPICS_LIBCA=/epics/base/lib/linux-x86_64/libca.so
ENV PATH="/epics/base/bin/linux-x86_64/:${PATH}"
RUN echo $pvServerURL
RUN echo $pvServerPort
RUN echo $pvServerNameSpace
VOLUME /pvServer/userAuthentication/users
CMD python pvServer.py
EXPOSE  5000 5001 5064 5065 8001 27017
