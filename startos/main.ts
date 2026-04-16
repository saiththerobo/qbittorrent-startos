import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting qBittorrent'))

  const appMounts = sdk.Mounts.of()
    .mountVolume({ volumeId: 'main', subpath: null, mountpoint: '/config', readonly: false })
    .mountVolume({ volumeId: 'downloads', subpath: null, mountpoint: '/downloads', readonly: false })

  const appSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'qbittorrent' },
    appMounts,
    'qbittorrent-main',
  )

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: appSub,
    exec: {
      // Use the upstream entrypoint (tini -> entrypoint.sh) which handles
      // user switching (doas -u qbtUser), directory chown, and legal notice.
      command: sdk.useEntrypoint(),
      env: {
        QBT_LEGAL_NOTICE: 'confirm',
        QBT_WEBUI_PORT: String(uiPort),
      },
    },
    ready: {
      display: i18n('Web Interface'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: i18n('The web interface is ready'),
          errorMessage: i18n('The web interface is not ready'),
        }),
      gracePeriod: 30_000,
    },
    requires: [],
  })
})
