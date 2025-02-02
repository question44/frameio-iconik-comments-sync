import axios from 'axios'
import { FRAME_IO_ACCESS_TOKEN } from 'src/config/env-vars'

export const frameIoClient = axios.create({
  baseURL: 'https://api.frame.io/v2/',
  headers: {
    'Authorization': `Bearer ${FRAME_IO_ACCESS_TOKEN}`,
  }
})
