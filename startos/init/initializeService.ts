import crypto from 'node:crypto'
import { FileHelper, utils } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { getAdminCredentials } from '../actions/getAdminCredentials'
import { uiPort } from '../utils'

function hashQBittorrentPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16)
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, key) => {
      if (err) return reject(err)
      resolve(`@ByteArray(${salt.toString('base64')}:${key.toString('base64')})`)
    })
  })
}

// FileHelper for the qBittorrent config file inside the main volume.
// Path relative to volume root: qBittorrent/config/qBittorrent.conf
// (matches entrypoint.sh: $profilePath/qBittorrent/config/qBittorrent.conf)
const qbtConf = FileHelper.string({
  base: sdk.volumes.main,
  subpath: './qBittorrent/config/qBittorrent.conf',
})

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  const adminPassword = utils.getDefaultString({
    charset: 'a-z,A-Z,0-9',
    len: 22,
  })
  const passwordHash = await hashQBittorrentPassword(adminPassword)
  await storeJson.write(effects, { adminPassword })

  // Pre-write qBittorrent.conf with the generated password hash so qBittorrent
  // starts with known credentials on first boot (no temp-password prompt).
  const configContent = [
    '[BitTorrent]',
    'Session\\DefaultSavePath=/downloads',
    '',
    '[LegalNotice]',
    'Accepted=true',
    '',
    '[Preferences]',
    `WebUI\\Password_PBKDF2="${passwordHash}"`,
    `WebUI\\Port=${uiPort}`,
    'WebUI\\Username=admin',
    'WebUI\\AuthSubnetWhitelistEnabled=false',
    'WebUI\\LocalHostAuth=true',
    'WebUI\\CSRFProtection=false',
    'WebUI\\ClickjackingProtection=false',
    'WebUI\\SecureCookie=false',
    'WebUI\\HostHeaderValidation=false',
    '',
  ].join('\n')

  await qbtConf.write(effects, configContent)

  await sdk.action.createOwnTask(effects, getAdminCredentials, 'critical', {
    reason: i18n('Retrieve your admin credentials'),
  })
})
