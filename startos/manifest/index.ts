import { setupManifest } from '@start9labs/start-sdk'
import { long, short, filebrowserDescription } from './i18n'

export const manifest = setupManifest({
  id: 'qbittorrent',
  title: 'qBittorrent',
  license: 'GPL-2.0',
  packageRepo: 'https://github.com/Start9Labs/qbittorrent-startos',
  upstreamRepo: 'https://github.com/qbittorrent/qBittorrent',
  marketingUrl: 'https://www.qbittorrent.org/',
  donationUrl: 'https://www.qbittorrent.org/donate',
  docsUrls: ['https://github.com/qbittorrent/qBittorrent/wiki'],
  description: { short, long },
  volumes: ['main', 'downloads'],
  images: {
    qbittorrent: {
      source: { dockerTag: 'qbittorrentofficial/qbittorrent-nox:5.1.4-2' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {
    filebrowser: {
      description: filebrowserDescription,
      optional: true,
      metadata: {
        title: 'File Browser',
        icon: 'https://raw.githubusercontent.com/Start9Labs/filebrowser-startos/fbf1fefb51cca9731f2a9a9e6f790ca150aa9d04/icon.svg',
      },
    },
  },
})
