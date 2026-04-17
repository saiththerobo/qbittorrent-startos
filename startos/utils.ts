import crypto from 'node:crypto'

export const uiPort = 8080

export function hashQBittorrentPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16)
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, key) => {
      if (err) return reject(err)
      resolve(`@ByteArray(${salt.toString('base64')}:${key.toString('base64')})`)
    })
  })
}
