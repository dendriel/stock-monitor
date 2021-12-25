const { processConditions } = require('./stock-monitor')

const bucket = process.env.BUCKET || 'stock-monitor'
const configFile = process.env.CONFIG || 'conditions.json'
const topic = process.env.TOPIC

exports.handler = async () => {
    try {
        console.log("Stock Monitor has started")
        await processConditions(bucket, configFile, topic)
    } catch (e) {
        console.log(`Stock Monitor execution has failed! ${e}`)
    }

    return { statusCode: 200 }
}
