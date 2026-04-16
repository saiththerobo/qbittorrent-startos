export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting qBittorrent': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The web interface of qBittorrent': 5,

  // actions/getAdminCredentials.ts
  'Get Admin Credentials': 6,
  'Retrieve admin username and password': 7,
  'Admin Credentials': 8,
  'Your admin credentials:': 9,
  'Username': 10,
  'Password': 11,

  // init/initializeService.ts
  'Retrieve your admin credentials': 12,

  // actions/downloadDestination.ts
  'Download Destination': 13,
  'File Browser': 14,
  'Local Storage': 16,
  'Select Download Destination': 17,
  'Service qBittorrent uses to save downloads': 18,

  // init/taskSelectDownloadDestination.ts
  'Select where qBittorrent saves downloads': 19,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
