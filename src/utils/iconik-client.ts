import axios from 'axios'
import { ICONIK_APP_ID, ICONIK_AUTH_TOKEN } from 'src/config/env-vars'
import { object, string } from 'yup'
import { withRateLimitInterceptor } from './retry-interceptor.js'

export const iconikClient = withRateLimitInterceptor(
  axios.create({
    baseURL: 'https://app.iconik.io/API/',
    headers: {
      'App-Id': ICONIK_APP_ID,
      'Auth-Token': ICONIK_AUTH_TOKEN,
    },
  }),
)

export const iconikApi = {
  comments: {
    addComment: async (params: {
      userId?: string
      assetId: string
      commentText: string
      parentId?: string | null
    }) => {
      return await iconikClient
        .post(`/assets/v1/assets/${params.assetId}/segments/`, {
          segment_type: 'COMMENT',
          segment_text: params.commentText,
          user_id: params.userId,
          parent_id: params.parentId,
        })
        .then((res) =>
          object({
            id: string().uuid().required(),
          }).validate(res.data),
        )
    },
    editComment: async (params: {
      assetId: string
      commentId: string
      commentText?: string
      completed?: boolean
    }) => {
      return await iconikClient.patch(
        `/assets/v1/assets/${params.assetId}/segments/${params.commentId}/`,
        {
          ...(params.commentText && { segment_text: params.commentText }),
          ...(typeof params.completed !== 'undefined' && {
            segment_checked: params.completed,
          }),
        },
      )
    },
    deleteComment: async (params: {
      assetId: string
      commentId: string
    }) => {
      return await iconikClient.delete(
        `/assets/v1/assets/${params.assetId}/segments/${params.commentId}/`,
      )
    },
  },
}
