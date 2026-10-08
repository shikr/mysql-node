import { Server } from "./server.js"
import 'dotenv/config'

const port = Number(process.env.PORT)

if (!port) {
  console.log('Port is required.')
  process.exit(1)
}

const server = new Server({ port })
server.start()
