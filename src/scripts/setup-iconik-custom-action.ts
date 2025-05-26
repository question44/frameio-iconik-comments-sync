import * as fs from 'node:fs'

import { ICONIK_CUSTOM_ACTION_ID } from 'src/config/env-vars.js'
import { iconikCustomActionConfig } from 'src/config/iconik-custom-action.js'
import { iconikClient } from 'src/utils/iconik-client.js'

if (ICONIK_CUSTOM_ACTION_ID) {
  await iconikClient.patch(
    `/assets/v1/custom_actions/${iconikCustomActionConfig.context}/${ICONIK_CUSTOM_ACTION_ID}/`,
    iconikCustomActionConfig,
  )
} else {
  const {
    data: { id },
  } = await iconikClient.post(
    `/assets/v1/custom_actions/${iconikCustomActionConfig.context}/`,
    iconikCustomActionConfig,
  )
  await fs.promises.writeFile('.env', `ICONIK_CUSTOM_ACTION_ID=${id}\n`, {
    flag: 'a+',
  })
}
