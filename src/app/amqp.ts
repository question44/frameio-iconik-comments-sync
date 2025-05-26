import { iconikCustomActionUseCase } from 'src/use-cases/iconik-custom-action-use-case.js'
import { CUSTOM_ACTION_QUEUE_NAME, amqpChannel } from 'src/utils/amqp.js'
import { iconikCustomActionPayloadSchema } from 'src/utils/iconik-custom-action-payload-schema.js'

await amqpChannel.consume(CUSTOM_ACTION_QUEUE_NAME, async (message) => {
  const payload = await iconikCustomActionPayloadSchema.validate(
    message?.content.toString(),
  )
  await iconikCustomActionUseCase(payload)
})
