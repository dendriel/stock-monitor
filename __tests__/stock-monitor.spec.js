const { test, expect } = require('@jest/globals');
const { processConditions, createNotification } = require('../lambda/stock-monitor')


jest.mock('../lambda/service/stock.service')
const { stockService } = require('../lambda/service/stock.service')

jest.mock('../lambda/service/notification.service')
const { notificationService } = require('../lambda/service/notification.service')

notificationService.sendNotification.mockImplementation(notification => {})

describe("Stock Monitor", () => {

  afterEach(() => {
    notificationService.sendNotification.mockClear()
    notificationService.sendNotification.mockImplementation(notification => {})
  })

  test.each`
    targetPrice | actualPrice | trigger
    ${8}        | ${8.05}     | ${'above'}
    ${6.75}     | ${6.76}     | ${'above'}
    ${100.01}   | ${200}      | ${'above'}
    ${8}        | ${7.50}     | ${'bellow'}
    ${6.75}     | ${6.74}     | ${'bellow'}
    ${99}       | ${98}       | ${'bellow'}  
  `('it should notify when $actualPrice (actual) is $trigger $targetPrice (target)', ({targetPrice, actualPrice, trigger}) => {
    const ticker = "AERI3"
    const condition = { ticker: ticker, trigger: trigger, price: targetPrice, repeat: true }

    const lastPriceEntry = {price: actualPrice, date: "13/12/21 10:50"}
    stockService.getPricesByTicker.mockImplementation(() => [
      {price: 8.08, date: "13/12/21 10:00"},
      {price: 8.00, date: "13/12/21 10:10"},
      {price: 7.94, date: "13/12/21 10:30"},
      {price: 7.88, date: "13/12/21 10:40"},
      lastPriceEntry
    ])

    processConditions([condition])

    expect(stockService.getPricesByTicker)
    .toHaveBeenCalledWith(ticker)

    const expectedNotification = createNotification(condition, lastPriceEntry)
    expect(notificationService.sendNotification)
    .toHaveBeenCalledTimes(1)
    .toHaveBeenCalledWith(expectedNotification)
  })

  test.each`
    targetPrice | actualPrice | previousPrice | trigger     | repeat
    ${8}        | ${8.05}     | ${8.03}       | ${'above'}  | ${true}
    ${6.75}     | ${6.76}     | ${6.80}       | ${'above'}  | ${true}
    ${100.01}   | ${200}      | ${150.15}     | ${'above'}  | ${true}
    ${8}        | ${7.50}     | ${7.55}       | ${'bellow'} | ${true}
    ${6.75}     | ${6.74}     | ${6.66}       | ${'bellow'} | ${true}
    ${99}       | ${98}       | ${95}         | ${'bellow'} | ${true}
  `('it should always notify when repeat is true', ({targetPrice, actualPrice, previousPrice, trigger, repeat}) => {
    const ticker = "AERI3"
    const condition = { ticker: ticker, trigger: trigger, price: targetPrice, repeat: repeat }

    const lastPriceEntry = {price: actualPrice, date: "13/12/21 10:50"}
    stockService.getPricesByTicker.mockImplementation(() => [
      {price: 8.08,          date: "13/12/21 10:00"},
      {price: 8.00,          date: "13/12/21 10:10"},
      {price: 7.94,          date: "13/12/21 10:30"},
      {price: previousPrice, date: "13/12/21 10:40"},
      lastPriceEntry
    ])

    processConditions([condition])

    expect(stockService.getPricesByTicker)
    .toHaveBeenCalledWith(ticker)

    const expectedNotification = createNotification(condition, lastPriceEntry)
    expect(notificationService.sendNotification)
    .toHaveBeenCalledTimes(1)
    .toHaveBeenCalledWith(expectedNotification)
  })

  test.each`
    targetPrice | actualPrice | previousPrice | trigger     | repeat
    ${8}        | ${8.05}     | ${8.03}       | ${'above'}  | ${false}
    ${6.75}     | ${6.76}     | ${6.80}       | ${'above'}  | ${false}
    ${100.01}   | ${200}      | ${150.15}     | ${'above'}  | ${false}
    ${8}        | ${7.50}     | ${7.55}       | ${'bellow'} | ${false}
    ${6.75}     | ${6.74}     | ${6.66}       | ${'bellow'} | ${false}
    ${99}       | ${98}       | ${95}         | ${'bellow'} | ${false}
  `('it should not re-notify when repeat is false', ({targetPrice, actualPrice, previousPrice, trigger, repeat}) => {
    const ticker = "AERI3"
    const condition = { ticker: ticker, trigger: trigger, price: targetPrice, repeat: repeat }

    const lastPriceEntry = {price: actualPrice, date: "13/12/21 10:50"}
    stockService.getPricesByTicker.mockImplementation(() => [
      {price: 8.08,          date: "13/12/21 10:00"},
      {price: 8.00,          date: "13/12/21 10:10"},
      {price: 7.94,          date: "13/12/21 10:30"},
      {price: previousPrice, date: "13/12/21 10:40"},
      lastPriceEntry
    ])

    processConditions([condition])

    expect(stockService.getPricesByTicker)
    .toHaveBeenCalledWith(ticker)

    expect(notificationService.sendNotification)
    .toHaveBeenCalledTimes(0)
  })

//  test("it should notify when conditions are meet", () => {
//    const lastPriceEntry = {price: 8.05, date: "13/12/21 10:50"}
//    stockService.getPricesByTicker.mockImplementation(() => [
//      {price: 8.08, date: "13/12/21 10:00"},
//      {price: 8.00, date: "13/12/21 10:10"},
//      {price: 7.94, date: "13/12/21 10:30"},
//      {price: 7.88, date: "13/12/21 10:40"},
//      lastPriceEntry
//    ])
//
//    const ticker = "AERI3"
//    const condition = { ticker: ticker, trigger:"above", price: 8, repeat: true }
//    const config = [ condition ]
//
//    processConditions(config)
//
//    expect(stockService.getPricesByTicker)
//    .toHaveBeenCalledWith(ticker)
//
//    const expectedNotification = createNotification(condition, lastPriceEntry)
//    expect(notificationService.sendNotification)
//    .toHaveBeenCalledWith(expectedNotification)
//
//  })
})