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

function processCondition(condition) {
  log(condition, `Processing: ${JSON.stringify(condition)}`)

  let stockPricesData = stockService.getPricesByTicker(condition.ticker)
  if (stockPricesData.length === 0) {
    log(condition, "No prices data found.")
    return
  }

  let lastPriceEntry = stockPricesData[stockPricesData.length - 1]
  log(condition, `Last price is ${lastPriceEntry.price} from ${lastPriceEntry.date}`)

  if (!isConditionMeet(condition, lastPriceEntry.price)) {
    log(condition, `Condition not meet.`)
    return
  }

  if (!hasNotificationToSend(condition, stockPricesData)) {
    log(condition, 'Has no notification to send.')
    return
  }

  const notification = createNotification(condition, lastPriceEntry)
  log(condition, notification)

  // send message to SNS
  notificationService.sendNotification(notification)
}

async function processConditions(bucket, file) {
  const config = await configurationService.getConfiguration(bucket, file)

  console.log(`Monitor loaded configuration: \"${JSON.stringify(config)}\"`)

  if (config) {
    config.forEach(processCondition)
  }
}

module.exports = {
  processConditions: processConditions,
  createNotification: createNotification
}
