const { handler } = require('./lambda/index')

const start = async () =>  {
    await handler()
}

start()
