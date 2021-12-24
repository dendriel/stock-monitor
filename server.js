const { processConditions } = require('./lambda/stock-monitor')

const bucket = process.env.BUCKET || 'stock-monitor'
const configFile = process.env.CONFIG || 'conditions.json'

const start = async () =>  {
    try {
        await processConditions(bucket, configFile)
    } catch (e) {
        console.log("Stock Monitor execution has failed!")
    }
}

start()
