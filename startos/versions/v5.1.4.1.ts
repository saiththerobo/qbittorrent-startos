import { VersionInfo } from '@start9labs/start-sdk'

export const v_5_1_4_1 = VersionInfo.of({
  version: '5.1.4:1',
  releaseNotes: {
    en_US: 'Initial release for StartOS',
    es_ES: 'Lanzamiento inicial para StartOS',
    de_DE: 'Erstveröffentlichung für StartOS',
    pl_PL: 'Pierwsze wydanie dla StartOS',
    fr_FR: 'Version initiale pour StartOS',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
