<p align="center">
  <img src="icon.png" alt="qBittorrent Logo" width="21%">
</p>

# qBittorrent on StartOS

> **Upstream repo:** <https://github.com/qbittorrent/qBittorrent>

qBittorrent is a free and open-source BitTorrent client with an integrated web UI for remote management. This package runs the official `qbittorrent-nox` (headless) image on StartOS.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                            |
| ------------- | ------------------------------------------------ |
| Image         | `qbittorrentofficial/qbittorrent-nox:5.1.4-2`   |
| Architectures | x86_64, aarch64                                  |
| Entrypoint    | Upstream entrypoint (`sdk.useEntrypoint()`)      |

**Environment variables set at runtime:**

| Variable         | Value  | Purpose                      |
| ---------------- | ------ | ---------------------------- |
| `QBT_LEGAL_NOTICE` | confirm | Accept the upstream legal notice |
| `QBT_WEBUI_PORT` | 8080   | Lock the web UI to port 8080 |

---

## Volume and Data Layout

| Volume      | Mount Point  | Purpose                               |
| ----------- | ------------ | ------------------------------------- |
| `main`      | `/config`    | qBittorrent config and internal state |
| `downloads` | `/downloads` | Downloaded files (local storage)      |

When File Browser is selected as the download destination, the File Browser `data` volume is additionally mounted at `/mnt/filebrowser` (read-write).

`store.json` (inside `main`) holds the generated admin password and the selected download destination.

---

## Installation and First-Run Flow

1. A 22-character alphanumeric admin password is generated and stored in `store.json`.
2. A `qBittorrent.conf` is written to the `main` volume with the hashed password, accepted legal notice, and `/downloads` as the default save path.
3. A critical task is created prompting the user to run the **Get Admin Credentials** action.
4. An informational task is created prompting the user to run the **Select Download Destination** action.

---

## Configuration Management

qBittorrent stores its own settings in `/config/qBittorrent/config/qBittorrent.conf`.

On every startup, the `DefaultSavePath` in that config is updated to match the selected download destination from `store.json`. This ensures the save path stays in sync if the user changes the destination via the StartOS action.

---

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose                   |
| --------- | ---- | -------- | ------------------------- |
| Web UI    | 8080 | HTTP     | qBittorrent web interface |

**Access methods:**

- LAN IP with unique port
- `<hostname>.local` with unique port
- Tor `.onion` address
- Custom domains (if configured)

The BitTorrent peer port (6881 by default) is managed by qBittorrent itself and is not exposed as a StartOS interface. Configure port forwarding in your router if incoming peer connections are required.

---

## Actions (StartOS UI)

| Action                       | Visibility | Description                                        |
| ---------------------------- | ---------- | -------------------------------------------------- |
| Get Admin Credentials        | Enabled    | Displays the generated admin username and password |
| Select Download Destination  | Enabled    | Choose where qBittorrent saves downloaded files    |

**Get Admin Credentials** is surfaced as a critical task on fresh install. Username is always `admin`; password is the generated value stored in `store.json`.

**Select Download Destination** is surfaced as a critical task on fresh install. Options are:

| Option       | Save Path                            |
| ------------ | ------------------------------------ |
| Local Storage | `/downloads` (built-in volume)      |
| File Browser | `/mnt/filebrowser/qbittorrent-downloads` |

Changing the destination takes effect on the next service restart. The `qbittorrent-downloads` folder inside File Browser is created automatically.

---

## Backups and Restore

**Included in backup:**

- `main` volume (config + store.json)
- `downloads` volume (all downloaded files)

**Restore behavior:** Both volumes are fully restored before the service starts.

---

## Health Checks

| Check         | Method                | Messages                                                                         |
| ------------- | --------------------- | -------------------------------------------------------------------------------- |
| Web Interface | Port listening (8080) | Success: "The web interface is ready" / Error: "The web interface is not ready"  |

---

## Dependencies

| Dependency   | Optional | Purpose                                           |
| ------------ | -------- | ------------------------------------------------- |
| File Browser | Yes      | Provides an alternative download destination volume |

---

## Limitations and Differences

1. **Peer port not exposed** — the BitTorrent peer port is not registered as a StartOS interface. Incoming connections require manual router port forwarding.
2. **Admin credentials are fixed at install** — there is no "Reset Password" action yet. To reset, uninstall and reinstall the service.
3. **Timezone hardcoded** — the container runs in UTC. qBittorrent display timestamps reflect UTC.
4. **Download destination change requires restart** — after selecting a new destination via the action, restart the service for the change to take effect.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: qbittorrent
image: qbittorrentofficial/qbittorrent-nox:5.1.4-2
architectures: [x86_64, aarch64]
volumes:
  main: /config         # qBittorrent config; also holds store.json
  downloads: /downloads # local download storage
  filebrowser[optional]: /mnt/filebrowser  # mounted when File Browser is selected
ports:
  ui: 8080
env_vars:
  QBT_LEGAL_NOTICE: confirm
  QBT_WEBUI_PORT: "8080"
dependencies:
  filebrowser:
    optional: true
    version: ">=2.62.2:0"
    purpose: alternative download destination
actions:
  get-admin-credentials:
    visibility: enabled
    triggered_by: critical task on install
    returns: username (admin) + masked copyable password
  download-destination:
    visibility: enabled
    triggered_by: critical task on install
    input: select (local | filebrowser)
    effect: updates store.json; takes effect on next restart
init_flow:
  - generates admin password, writes qBittorrent.conf with password hash
  - creates critical task for get-admin-credentials
  - creates critical task for download-destination
main_flow:
  - reads downloadDestination from store.json
  - updates DefaultSavePath in qBittorrent.conf to match destination
  - conditionally mounts filebrowser volume (readonly: false)
  - mkdir-download oneshot: creates qbittorrent-downloads folder and chmod 777
  - primary daemon starts via sdk.useEntrypoint()
```

