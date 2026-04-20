import { VersionInfo } from '@start9labs/start-sdk'

export const v_5_1_4_2 = VersionInfo.of({
  version: '5.1.4:2',
  releaseNotes: {
    en_US: 'Switched to libtorrent2 build for improved performance and memory usage',
    es_ES: 'Cambio a la compilación libtorrent2 para mejor rendimiento y uso de memoria',
    de_DE: 'Wechsel zu libtorrent2-Build für verbesserte Leistung und Speichernutzung',
    pl_PL: 'Przełączono na kompilację libtorrent2 dla lepszej wydajności i użycia pamięci',
    fr_FR: 'Passage à la version libtorrent2 pour de meilleures performances et utilisation mémoire',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
