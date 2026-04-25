import { VersionGraph } from '@start9labs/start-sdk'
import { v_5_1_4_3 } from './v5.1.4.3'
import { v_5_1_4_2 } from './v5.1.4.2'
import { v_5_1_4_1 } from './v5.1.4.1'

export const versionGraph = VersionGraph.of({
  current: v_5_1_4_3,
  other: [v_5_1_4_2, v_5_1_4_1],
})
