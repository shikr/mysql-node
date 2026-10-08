import express from "express"
import routes from './routes/index.js'

interface ServerOptions {
  port: number
}

export class Server {
  private readonly port: number;
  private readonly server = express()

  constructor(options: ServerOptions) {
    this.port = options.port
    this.server.use(express.json())
    this.server.use('/api/v1', routes)
  }

  start() {
    this.server.listen(this.port, () => {
      console.log("Server running on port: %d", this.port)
    })
  }
}
