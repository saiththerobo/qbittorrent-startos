import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

export const getAdminCredentials = sdk.Action.withoutInput(
  'get-admin-credentials',

  async ({ effects }) => ({
    name: i18n('Get Admin Credentials'),
    description: i18n('Retrieve admin username and password'),
    warning: null,
    allowedStatuses: 'any' as const,
    group: null,
    visibility: 'hidden' as const,
  }),

  async ({ effects }) => {
    const store = await storeJson.read().once()

    return {
      version: '1' as const,
      title: i18n('Admin Credentials'),
      message: i18n('Your admin credentials:'),
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: i18n('Username'),
            description: null,
            value: 'admin',
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single' as const,
            name: i18n('Password'),
            description: null,
            value: store?.adminPassword ?? 'UNKNOWN',
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
