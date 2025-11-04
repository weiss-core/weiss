# epicsWS - EPICS Web Socket

This folder provides the source code for the EPICS Web Socket, used as bridge between PVA/CA and the
web application.

The CA/PVA library used is [pvaPy](https://github.com/epics-base/pvaPy), and the general web socket
concept was based on [PV Web Socket (PVWS)](https://github.com/ornl-epics/pvws).

pvaPy was chosen due to support of both PVA and CA providers within the same codebase. This
simplifies implementation since the same handlers and functions can be used for both protocols,
providing the same output to clients without needing additional libraries or handlers.
