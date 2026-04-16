import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  downloadDestination: Value.select({
    name: i18n('Download Destination'),
    values: {
      local: i18n('Local Storage'),
      filebrowser: i18n('File Browser'),
    },
    default: 'local',
  }),
})

export const downloadDestination = sdk.Action.withInput(
  // id
  'download-destination',

  // metadata
  async ({ effects }) => ({
    name: i18n('Select Download Destination'),
    description: i18n('Service qBittorrent uses to save downloads'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => ({
    downloadDestination:
      (await storeJson.read((s) => s.downloadDestination).const(effects)) || 'local',
  }),

  // the execution function
  async ({ effects, input }) =>
    storeJson.merge(effects, { downloadDestination: input.downloadDestination }),
)
