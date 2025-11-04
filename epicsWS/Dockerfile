FROM python:3.12-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONUNBUFFERED=1

ENV EPICS_DEFAULT_PROTOCOL=pva
ENV EPICS_CA_ADDR_LIST=localhost
ENV EPICS_PVA_ADDR_LIST=localhost

EXPOSE 8080

CMD ["python", "epicsWS.py"]
