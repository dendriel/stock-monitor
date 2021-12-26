const { processConditions } = require('./stock-monitor')

const bucket = process.env.BUCKET || 'stock-monitor'
const configKey = process.env.CONFIG_KEY || 'conditions.json'
const topic = process.env.TOPIC

exports.handler = async () => {
    try {
        console.log("Stock Monitor has started")
        await processConditions(bucket, configKey, topic)
    } catch (e) {
        console.log(`Stock Monitor execution has failed! ${e}`)
    }

    return { statusCode: 200 }
}
