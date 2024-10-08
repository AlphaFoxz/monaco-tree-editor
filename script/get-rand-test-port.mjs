import getPort from 'get-port'
import fs from 'node:fs'

const port = await getPort()
fs.writeFileSync('./.env.test.local', `VITE_SERVER_PORT=${port}`)
