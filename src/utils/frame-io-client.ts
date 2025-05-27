import axios from 'axios'
import { FRAME_IO_ACCESS_TOKEN } from 'src/config/env-vars'
import { boolean, date, object, string } from 'yup'

export const frameIoClient = axios.create({
  baseURL: 'https://api.frame.io/v2/',
  headers: {
    Authorization: `Bearer ${FRAME_IO_ACCESS_TOKEN}`,
  },
})

export const frameIoApi = {
  comments: {
    getComment: async (commentId: string) => {
      return await frameIoClient.get(`comments/${commentId}`).then((res) =>
        object({
          id: string().uuid().required(),
          text: string().required(),
          owner_id: string().uuid().required(),
          asset_id: string().uuid().required(),
          parent_id: string().uuid().nullable(),
          completed: boolean().required(),
          owner: object({
            email: string().email().required(),
          }),
          updated_at: date().required(),
        }).validate(res.data),
      )
    },
  },
  accounts: {
    getAccount: async (accountId: string) => {
      return await frameIoClient.get(`accounts/${accountId}`).then((res) =>
        object({
          id: string().uuid().required(),
          owner: object({
            id: string().uuid().required(),
            email: string().email().required(),
          }),
        }).validate(res.data),
      )
    },
  },
}
