const { stockService } = require('./service/stock.service')
const { notificationService } = require('./service/notification.service')
const { configurationService } = require('./service/configuration.service')

const triggerEvaluator = {
  above:  (target, actual) => actual > target,
  bellow: (target, actual) => actual < target,
}

function log(condition, message) {
  console.log(`[${condition.ticker}] ${message}`)
}

function createNotification(condition, stockPricesData) {
  return `Stock ${condition.ticker} reached the price R\$${stockPricesData.price} at ${stockPricesData.date}.\n` +
         `Conditional: ${getConditionTrigger(condition)}\n` +
         `Threshold: ${condition.price}`
}

function hasNotificationToSend(condition, stockPricesData) {
  if (condition.repeat) {
    log(condition, 'Notification is repeatable')
    return true
  }

  if (stockPricesData.length <= 1) {
    log(condition, 'Not enough price entries to check last execution result')
    return true
  }

  let previousPriceEntry = stockPricesData[stockPricesData.length - 2]
  if (isConditionMeet(condition, previousPriceEntry.price)) {
    log(condition, 'Notification already sent in last execution')
    return false
  }

  return true
}

function getConditionTrigger(condition) {
  return condition.trigger ? condition.trigger : 'above'
}

function isConditionMeet(condition, price) {
  const trigger = getConditionTrigger(condition)
  return triggerEvaluator[trigger](condition.price, price)
}

async function processCondition(condition) {
    log(condition, `Processing: ${JSON.stringify(condition)}`)

    const prices = await stockService.getPricesByTicker(condition.ticker)
    if (!prices || prices.length === 0) {
      log(condition, 'Prices data is empty!')
      return
    }

    let lastPriceEntry = prices[prices.length - 1]
    log(condition, `Last price is ${lastPriceEntry.price} from ${lastPriceEntry.date}`)

    if (!isConditionMeet(condition, lastPriceEntry.price)) {
      log(condition, `Condition not meet.`)
      return
    }

    if (!hasNotificationToSend(condition, prices)) {
      log(condition, 'Has no notification to send.')
      return
    }

    return createNotification(condition, lastPriceEntry)
}

async function processConditions(bucket, file, topic) {
    const config = await configurationService.getConfiguration(bucket, file)

    console.log(`Monitor loaded configuration: \"${JSON.stringify(config)}\"`)

    for (const condition of config) {
        const notification = await processCondition(condition)
        if (notification) {
            await notificationService.sendNotification(topic, notification)
        }
    }
}

module.exports = {
  processConditions: processConditions,
  createNotification: createNotification
}
