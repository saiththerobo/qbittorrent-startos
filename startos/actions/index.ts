import { sdk } from '../sdk'
import { getAdminCredentials } from './getAdminCredentials'
import { downloadDestination } from './downloadDestination'
import { resetAdminPassword } from './resetAdminPassword'

export const actions = sdk.Actions.of()
  .addAction(getAdminCredentials)
  .addAction(downloadDestination)
  .addAction(resetAdminPassword)
