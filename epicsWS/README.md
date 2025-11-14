# epicsWS - EPICS Web Socket

This folder provides the source code for the EPICS Web Socket, used as bridge between PVA/CA and the
web application.

- The PVA library used is [p4p](https://github.com/epics-base/p4p/), see [p4pClient](./p4pClient).
- The CA library used is [caproto](https://github.com/caproto/caproto), see
  [caprotoClient](./caprotoClient.py).

The web socket application and connection manager can be seen in [epicsWS](./epicsWS.py). The
concept was based on [ORNL PV Web Socket (PVWS)](https://github.com/ornl-epics/pvws).

### How it works

Based on the default protocol (see [.env](../.env.example)) or the channel prefix of the PV names
(e.g `pva://` or `ca://`), the WS chooses the correct provider. The incoming messages from all
origins are parsed through a common interface defined on [pvParser](./pvParser.py). This results in
a standard structure in the format of the `PVData` class, regardless of the origin of the message.

This class was based on the EPICS Normative Types (with minor modifications for convenience), so a
known format is used, and the front-end client only needs to know one data structure for all
protocols. Similar to PVWS, **extra fields were added for base64 encoding** for arrays, improving
JSON data traffic. A separate field for enumeration strings for enum/enum-like records was also
added.
