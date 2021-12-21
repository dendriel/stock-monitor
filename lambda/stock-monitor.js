
const triggerEvaluator = {
  above:  (baseline, actual) => actual > baseline,
  bellow: (baseline, actual) => actual < baseline,
}


function log(condition, message) {
  console.log(`[${condition.ticker}] ${message}`)
}

function createNotification(condition, stockPricesData) {
  return `Stock ${condition.ticker} reached the price R${stockPricesData.price} at ${stockPricesData.date}.\n` +
         `Conditional: ${condition.trigger}\n` +
         `Threshold: ${condition.price}`
}

function getStockPricesData(ticker) {
  // Get from provider
  let responseData = [
    {
        prices: [
            {price: 8.08, date: "13/12/21 10:00"},
            {price: 8.00, date: "13/12/21 10:10"},
            {price: 7.94, date: "13/12/21 10:30"},
            {price: 8.04, date: "13/12/21 10:40"},
            {price: 8.05, date: "13/12/21 10:50"}
        ]
    }
  ]

  if (!responseData || responseData.length === 0) {
    return []
  }

  return responseData[0].prices
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
  if (isConditionMeet(condition, previousPriceEntry)) {
    log(condition, 'Notification already sent in last execution')
    return false
  }

  return true
}

function isConditionMeet(condition, price) {
  return triggerEvaluator[condition.trigger](condition.baseline, price)
}

function processCondition(condition) {
  log(condition, `Processing: ${JSON.stringify(condition)}`)

  if (triggerEvaluator[condition.trigger] === undefined) {
    log(condition, `Invalid trigger type \"${condition.trigger}\"`)
    return
  }

  let stockPricesData = getStockPricesData(condition.ticker)
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

  const notification = createNotification(condition, stockPricesData)
  log(condition, notification)

  // send message to SNS
}


exports.monitor = (config) => {
  console.log(`Monitor called with configuration: \"${JSON.stringify(config)}\"`)
  config.forEach(processCondition)
}