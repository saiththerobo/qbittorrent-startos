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

| Variable        | Value  | Purpose                     |
| --------------- | ------ | --------------------------- |
| `QBT_EULA`      | accept | Accept the upstream EULA    |
| `QBT_WEBUI_PORT`| 8080   | Lock the web UI to port 8080|

---

## Volume and Data Layout

| Volume      | Mount Point  | Purpose                              |
| ----------- | ------------ | ------------------------------------ |
| `main`      | `/config`    | qBittorrent config and internal state|
| `downloads` | `/downloads` | Downloaded files                     |

`store.json` (inside `main`) holds the generated admin password for display via the Get Admin Credentials action.

---

## Installation and First-Run Flow

1. A 22-character alphanumeric admin password is generated and written to `store.json`.
2. A minimal `qBittorrent.conf` is written to the `main` volume via `SubContainer.withTemp()`. It accepts the EULA and disables localhost auth (`WebUI\LocalhostAuthEnabled=false`) so the bootstrap step can call the API without a session cookie.
3. A `runUntilSuccess` chain starts qBittorrent temporarily, waits for it to be healthy on port 8080, then calls `POST /api/v2/app/setPreferences` to set the generated password, re-enable localhost auth, and configure `/downloads` as the default save path.
4. A critical task is created prompting the user to run the **Get Admin Credentials** action before first use.
5. On every normal startup a `chown -R 1000:1000` oneshot fixes volume ownership before the main daemon starts.

---

## Configuration Management

qBittorrent stores its own settings in `/config/qBittorrent/qBittorrent.conf`. All user-facing configuration (download paths, speed limits, etc.) is managed directly through the qBittorrent web UI — there are no StartOS-side config actions beyond credential retrieval.

---

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose                  |
| --------- | ---- | -------- | ------------------------ |
| Web UI    | 8080 | HTTP     | qBittorrent web interface|

**Access methods:**

- LAN IP with unique port
- `<hostname>.local` with unique port
- Tor `.onion` address
- Custom domains (if configured)

The BitTorrent peer port (6881 by default) is managed by qBittorrent itself and is not exposed as a StartOS interface. Configure port forwarding in your router if incoming peer connections are required.

---

## Actions (StartOS UI)

| Action                  | Visibility | Description                                       |
| ----------------------- | ---------- | ------------------------------------------------- |
| Get Admin Credentials   | Hidden     | Displays the generated admin username and password|

The action is surfaced as a critical task on fresh install. Username is always `admin`; password is the generated value stored in `store.json`.

---

## Backups and Restore

**Included in backup:**

- `main` volume (config + store.json)
- `downloads` volume (all downloaded files)

**Restore behavior:** Both volumes are fully restored before the service starts.

---

## Health Checks

| Check         | Method               | Messages                                                                          |
| ------------- | -------------------- | --------------------------------------------------------------------------------- |
| Web Interface | Port listening (8080)| Success: "The web interface is ready" / Error: "The web interface is not ready"   |

---

## Dependencies

None.

---

## Limitations and Differences

1. **Peer port not exposed** — the BitTorrent peer port is not registered as a StartOS interface. Incoming connections require manual router port forwarding.
2. **Admin credentials are fixed at install** — there is no "Reset Password" action yet. To reset, uninstall and reinstall the service.
3. **Timezone hardcoded** — the container runs in UTC. qBittorrent display timestamps reflect UTC.

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
  main: /config       # qBittorrent config; also holds store.json
  downloads: /downloads
ports:
  ui: 8080
env_vars:
  QBT_EULA: accept
  QBT_WEBUI_PORT: "8080"
dependencies: none
actions:
  get-admin-credentials:
    visibility: hidden
    triggered_by: critical task on install
    returns: username (admin) + masked copyable password
init_flow:
  - SubContainer.withTemp writes initial qBittorrent.conf (EULA accepted, localhost auth bypassed)
  - runUntilSuccess: starts qBittorrent, calls setPreferences to set password + re-enable auth
  - creates critical task pointing to get-admin-credentials action
main_flow:
  - chown oneshot fixes volume ownership (1000:1000)
  - primary daemon starts via sdk.useEntrypoint()
```
