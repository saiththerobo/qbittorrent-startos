import { VersionGraph } from '@start9labs/start-sdk'
import { v_5_1_4_1 } from './v5.1.4.1'
import { v_5_1_4_2 } from './v5.1.4.2'

export const versionGraph = VersionGraph.of({
  current: v_5_1_4_2,
  other: [v_5_1_4_1],
})
