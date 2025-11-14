# WEISS - Web EPICS Interface Studio

This is a no-code drag and drop tool for EPICS web operation interfaces.

Follow the app development and mapped improvements on
[WEISS Project Dashboard](https://github.com/orgs/weiss-core/projects/1/)

## Dependencies

- Docker (tested with 28.1.1)
- Docker Compose (tested with v2.35.1)

## Getting started

1. Clone this repo

2. Create your .env: Since we don't yet use secrets or certificates, you can just copy
   [.env.example](./.env.example) into your `.env`.

```
cp .env.example .env
```

> You can use your `.env` file for tailoring the EPICS communication configurations (default
> protocol (ca|pva), CA_ADDR_LIST, PVA_ADDR_LIST, etc).

1. Launch the app:

### Development version

For accessing the development version (source code mounted + demoioc), run
`docker compose -f docker-compose-dev.yml up`. After build, three services will start:

- weiss-demoioc: EPICS demonstration IOC for dev / testing purposes (see
  [examples/exampleIOC](examples/exampleIOC)).
- weiss-epicsws: EPICS WebSocket and PV communication layer;
- weiss-dev: The WEISS front-end application. It should be accessible in `localhost:5173`.

**Extra: ** The file [example-opi.json](./examples/example-opi.json) provides a ready-to-test OPI
linked to the Demo IOC. You can upload it by clicking on the "upload file" button on the navbar.
Edit it as you will. Whenever you are ready, click the "Preview" button to start communication. You
should see something similar to this:

![Example image](./public/example.png)

### Production version

- WIP

## Notes

This is a React + TypeScript application. Several components and elements of the design are based in
[Material UI library](https://mui.com/material-ui/)
