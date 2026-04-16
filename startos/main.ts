import { FileHelper } from '@start9labs/start-sdk'
import { manifest as filebrowserManifest } from 'filebrowser-startos/startos/manifest'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'

const qbtConf = FileHelper.string({
  base: sdk.volumes.main,
  subpath: './qBittorrent/config/qBittorrent.conf',
})

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting qBittorrent'))

  const downloadDestination =
    (await storeJson.read((s) => s.downloadDestination).const(effects)) || 'local'

  const savePath =
    downloadDestination === 'filebrowser'
      ? '/mnt/filebrowser/qbittorrent-downloads'
      : '/downloads'

  // Update DefaultSavePath in the qBittorrent config on every startup so the
  // path stays in sync with the selected download destination.
  const currentContent = await qbtConf.read().once()
  if (currentContent) {
    const updatedContent = currentContent.replace(
      /Session\\DefaultSavePath=.*/,
      `Session\\DefaultSavePath=${savePath}`,
    )
    if (updatedContent !== currentContent) {
      await qbtConf.write(effects, updatedContent)
    }
  }

  let appMounts = sdk.Mounts.of()
    .mountVolume({ volumeId: 'main', subpath: null, mountpoint: '/config', readonly: false })
    .mountVolume({ volumeId: 'downloads', subpath: null, mountpoint: '/downloads', readonly: false })

  if (downloadDestination === 'filebrowser') {
    appMounts = appMounts.mountDependency<typeof filebrowserManifest>({
      dependencyId: 'filebrowser',
      volumeId: 'data',
      subpath: null,
      mountpoint: '/mnt/filebrowser',
      readonly: false,
    })
  }

  const appSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'qbittorrent' },
    appMounts,
    'qbittorrent-main',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('mkdir-download', {
      subcontainer: appSub,
      exec: {
        // Idempotent: creates the download folder in the dependency volume and
        // ensures it is world-writable so qbtUser can write to it.
        // For local /downloads this is a no-op (directory already exists).
        command: ['sh', '-c', `mkdir -p '${savePath}' && chmod 777 '${savePath}'`],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('primary', {
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
      requires: ['mkdir-download'],
    })
})
