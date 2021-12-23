const { processConditions } = require('./lambda/stock-monitor')
const { configurationService } = require('./lambda/service/configuration.service')

const bucket = process.env.BUCKET || 'stock-monitor'
const configFile = process.env.CONFIG || 'conditions.json'

const start = async () =>  {
    try {
        const config = await configurationService.getConfiguration(bucket, configFile)
        processConditions(config)
    } catch (e) {
        console.log("Stock Monitor execution has failed!")
    }
}

start()
