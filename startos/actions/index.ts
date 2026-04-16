import { sdk } from '../sdk'
import { getAdminCredentials } from './getAdminCredentials'

export const actions = sdk.Actions.of().addAction(getAdminCredentials)
