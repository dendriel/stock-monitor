const { handler } = require('./stock-monitor/index')

const start = async () =>  {
    await handler()
}

start()
