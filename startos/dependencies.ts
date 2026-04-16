import { T } from '@start9labs/start-sdk'
import { storeJson } from './fileModels/store.json'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const downloadDestination =
    (await storeJson.read((s) => s.downloadDestination).const(effects)) ?? 'local'

  const deps: T.CurrentDependenciesResult<any> = {}

  if (downloadDestination === 'filebrowser') {
    deps['filebrowser'] = {
      kind: 'exists',
      versionRange: '>=2.62.2:0',
    }
  }

  return deps
})
