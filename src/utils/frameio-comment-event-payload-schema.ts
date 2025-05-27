import { type InferType, object, string } from 'yup'

export const frameIoCommentEventPayloadSchema = object({
  type: string()
    .oneOf([
      'comment.created',
      'comment.updated',
      'comment.deleted',
      'comment.completed',
      'comment.uncompleted',
    ])
    .required(),
  resource: object({
    type: string().oneOf(['comment']).required(),
    id: string().uuid().required(),
  }).required(),
  user: object({
    id: string().uuid().required(),
  }).required(),
  team: object({
    id: string().uuid().required(),
  }).required(),
}).json()

export type FrameIoCommentEventPayload = InferType<
  typeof frameIoCommentEventPayloadSchema
>
