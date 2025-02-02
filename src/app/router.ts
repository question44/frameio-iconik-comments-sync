import express from 'express'
import { ICONIK_CUSTOM_ACTION_URL_PATH } from 'src/config/iconik-custom-action.js'
import {
  amqpChannel,
  CUSTOM_ACTION_MESSAGE_TYPE,
  TOPIC_NAME,
} from 'src/utils/amqp.js'
import { iconikCustomActionPayloadSchema } from 'src/utils/iconik-custom-action-payload-schema.js'

export const apiRouter = express.Router()

apiRouter.post(ICONIK_CUSTOM_ACTION_URL_PATH, async (req, res) => {
  console.log('Received custom action request')
  const payload = await iconikCustomActionPayloadSchema.validate(req.body)
  amqpChannel.publish(TOPIC_NAME, CUSTOM_ACTION_MESSAGE_TYPE, Buffer.from(JSON.stringify(payload)))
  res.status(202).json({ status: 'Accepted' })
})
