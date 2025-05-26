import bodyParser from 'body-parser'
import express from 'express'

import 'src/app/amqp'
import { apiRouter } from 'src/app/router'

const app = express()
const port = 3000

app.use(bodyParser.json())
// app.use('/', (_, res) => res.send('Hello World!'))
app.use('/', (req, res, next) => {
  console.log(req.method, req.url)
  next()
})
app.use('/api', apiRouter)

app.listen(port, () => {
  console.log(`App listening on ports ${port}`)
})
