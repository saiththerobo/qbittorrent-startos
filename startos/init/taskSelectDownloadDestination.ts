import { downloadDestination } from '../actions/downloadDestination'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskSelectDownloadDestination = sdk.setupOnInit(async (effects) => {
  const current = await storeJson.read((s) => s.downloadDestination).const(effects)
  if (current === undefined) {
    await sdk.action.createOwnTask(effects, downloadDestination, 'critical', {
      reason: i18n('Select where qBittorrent saves downloads'),
    })
  }
})
