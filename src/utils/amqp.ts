import amqplib from 'amqplib'

import { AMQP_URL } from 'src/config/env-vars.js'

export const TOPIC_NAME = 'base-nodejs-test'

const connectionUrl = new URL(AMQP_URL)
const connection = await amqplib.connect({
  protocol: connectionUrl.protocol.slice(0, -1),
  hostname: connectionUrl.hostname,
  port: Number.parseInt(connectionUrl.port),
  frameMax: 8192,
})

export const CUSTOM_ACTION_MESSAGE_TYPE = 'custom-action'
export const CUSTOM_ACTION_QUEUE_NAME = 'custom-action.queue'

export const amqpChannel = await connection.createChannel()
await amqpChannel.assertExchange(TOPIC_NAME, 'topic')

await amqpChannel.assertQueue(CUSTOM_ACTION_QUEUE_NAME)
await amqpChannel.bindQueue(
  CUSTOM_ACTION_QUEUE_NAME,
  TOPIC_NAME,
  CUSTOM_ACTION_MESSAGE_TYPE,
)
