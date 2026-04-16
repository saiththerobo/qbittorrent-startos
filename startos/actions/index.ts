import { sdk } from '../sdk'
import { getAdminCredentials } from './getAdminCredentials'
import { downloadDestination } from './downloadDestination'

export const actions = sdk.Actions.of()
  .addAction(getAdminCredentials)
  .addAction(downloadDestination)
