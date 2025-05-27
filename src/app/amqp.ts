import { iconikCustomActionUseCase } from 'src/use-cases/iconik-custom-action-use-case.js'
import {
  COMMENT_ACTION_QUEUE_NAME,
  CUSTOM_ACTION_QUEUE_NAME,
  amqpChannel,
} from 'src/utils/amqp.js'
import { iconikCustomActionPayloadSchema } from 'src/utils/iconik-custom-action-payload-schema.js'
import { frameIoCommentUseCase } from '../use-cases/frameio-comment-use-case.js'
import { frameIoCommentEventPayloadSchema } from '../utils/frameio-comment-event-payload-schema.js'

await amqpChannel.consume(CUSTOM_ACTION_QUEUE_NAME, async (message) => {
  const payload = await iconikCustomActionPayloadSchema.validate(
    message?.content.toString(),
  )
  await iconikCustomActionUseCase(payload)
  if (message) {
    amqpChannel.ack(message)
  }
})

await amqpChannel.consume(COMMENT_ACTION_QUEUE_NAME, async (message) => {
  if (!message) {
    return
  }
  const payload = await frameIoCommentEventPayloadSchema.validate(
    message?.content.toString(),
  )
  await frameIoCommentUseCase({ payload, message, channel: amqpChannel })
})
