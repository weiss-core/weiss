#!../../bin/linux-x86_64/example

< envPaths

cd "${TOP}"

dbLoadDatabase "dbd/example.dbd"
example_registerRecordDeviceDriver pdbbase

epicsEnvSet("P", "Demo:")
epicsEnvSet("R", "Weiss:")
dbLoadRecords("./exampleApp/Db/example.db", "P=$(P), R=$(R)")

cd "${TOP}/iocBoot/${IOC}"
iocInit
