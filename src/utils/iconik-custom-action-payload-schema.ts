import {
  array,
  date,
  InferType,
  object,
  string,
} from 'yup'

export const iconikCustomActionPayloadSchema = object({
  user_id: string().uuid().required(),
  system_domain_id: string().uuid(),
  context: string().oneOf(['ASSET']),
  action_id: string(),
  asset_ids: array(string().uuid().required()).required(),
  collection_ids: array(string().uuid()),
  saved_search_ids: array(string().uuid()),
  date_created: date().required(),
  auth_token: string().strip(),
}).json()

export type IconikCustomActionPayload = InferType<typeof iconikCustomActionPayloadSchema>
