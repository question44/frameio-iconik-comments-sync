import express from 'express'
import bodyParser from 'body-parser'

import 'src/app/amqp'
import { apiRouter } from 'src/app/router'

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use('/api', apiRouter)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
