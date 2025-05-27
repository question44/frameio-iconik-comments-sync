import crypto from 'node:crypto'
import express from 'express'
import type { Request } from 'express-serve-static-core'
import { ICONIK_CUSTOM_ACTION_URL_PATH } from 'src/config/iconik-custom-action.js'
import {
  COMMENT_ROUTING_KEY,
  CUSTOM_ACTION_MESSAGE_TYPE,
  TOPIC_NAME,
  amqpChannel,
} from 'src/utils/amqp.js'
import { iconikCustomActionPayloadSchema } from 'src/utils/iconik-custom-action-payload-schema.js'
import { number, object, string } from 'yup'
import { FRAME_IO_COMMENTS_WEBHOOK_SECRET } from '../config/env-vars.js'
import { frameIoCommentEventPayloadSchema } from '../utils/frameio-comment-event-payload-schema.js'

export const apiRouter = express.Router()

apiRouter.post(ICONIK_CUSTOM_ACTION_URL_PATH, async (req, res) => {
  console.log('Received custom action request')
  const payload = await iconikCustomActionPayloadSchema.validate(req.body)
  amqpChannel.publish(
    TOPIC_NAME,
    CUSTOM_ACTION_MESSAGE_TYPE,
    Buffer.from(JSON.stringify(payload)),
  )
  res.status(202).json({ status: 'Accepted' })
})

const frameIoWebhookEventHeadersSchema = object({
  'x-frameio-request-timestamp': number().required(),
  'x-frameio-signature': string().required(),
})

const validateFrameIoWebhookEvent = async (req: Request) => {
  const headers = await frameIoWebhookEventHeadersSchema
    .validate(req.headers)
    .catch(() => false as false)

  if (!headers) {
    return false
  }
  const timestamp = headers['x-frameio-request-timestamp']
  const signature = headers['x-frameio-signature']

  const currentTimestamp = new Date().getTime() / 1000
  const expired = currentTimestamp - timestamp > 5 * 60
  if (expired) {
    console.log('Event expired')
    return false
  }
  const jsonData = JSON.stringify(req.body)
  const hmac1 = crypto.createHmac('sha256', FRAME_IO_COMMENTS_WEBHOOK_SECRET)
  const generatedSignature = hmac1
    .update(`v0:${timestamp}:${jsonData}`)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(`v0=${generatedSignature}`),
    Buffer.from(signature),
  )
}

apiRouter.post('/frame-io/comment/event', async (req, res) => {
  // if (!(await validateFrameIoWebhookEvent(req))) {
  //   res.status(400).json({ message: 'Invalid event signature' })
  //   return
  // }

  const payload = await frameIoCommentEventPayloadSchema.validate(req.body)

  amqpChannel.publish(
    TOPIC_NAME,
    COMMENT_ROUTING_KEY,
    Buffer.from(JSON.stringify(payload)),
  )
  res.status(202).json({ status: 'Accepted' })
})
