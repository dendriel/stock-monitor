const { test, expect } = require('@jest/globals');
const { processConditions, createNotification } = require('../lambda/stock-monitor')


jest.mock('../lambda/service/stock.service')
const { stockService } = require('../lambda/service/stock.service')

jest.mock('../lambda/service/notification.service')
const { notificationService } = require('../lambda/service/notification.service')

const notificationServiceSpy = jest.spyOn(notificationService, 'sendNotification').mockImplementation()

describe("Stock Monitor", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test.each`
    targetPrice | actualPrice | trigger
    ${8}        | ${8.05}     | ${'above'}
    ${6.75}     | ${6.76}     | ${'above'}
    ${100.01}   | ${200}      | ${'above'}
    ${100.01}   | ${200}      | ${undefined}
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
    expect(notificationServiceSpy)
    .toHaveBeenCalledWith(expectedNotification)
  })

  test.each`
    targetPrice | actualPrice | previousPrice | trigger     | repeat
    ${8}        | ${8.05}     | ${8.03}       | ${'above'}  | ${true}
    ${6.75}     | ${6.76}     | ${6.80}       | ${'above'}  | ${true}
    ${100.01}   | ${200}      | ${150.15}     | ${'above'}  | ${true}
    ${100.01}   | ${200}      | ${150.15}     | ${'above'}  | ${true}
    ${8}        | ${7.50}     | ${7.55}       | ${'bellow'} | ${true}
    ${6.75}     | ${6.74}     | ${6.66}       | ${'bellow'} | ${true}
    ${99}       | ${98}       | ${95}         | ${'bellow'} | ${true}
  `('it should notify when $actualPrice (actual) > $targetPrice (target) and also $previousPrice (previous) > $targetPrice (target) trigger is $trigger and repeat is true', ({targetPrice, actualPrice, previousPrice, trigger, repeat}) => {
    const ticker = "VALE3"
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
    expect(notificationServiceSpy)
    .toHaveBeenCalledWith(expectedNotification)
  })

  test.each`
    targetPrice | actualPrice | previousPrice | trigger     | repeat
    ${8}        | ${8.05}     | ${8.03}       | ${'above'}  | ${false}
    ${6.75}     | ${6.76}     | ${6.80}       | ${'above'}  | ${false}
    ${100.01}   | ${200}      | ${150.15}     | ${'above'}  | ${false}
    ${100.01}   | ${200}      | ${150.15}     | ${'above'}  | ${undefined}
    ${100.01}   | ${200}      | ${150.15}     | ${undefined}| ${undefined}
    ${8}        | ${7.50}     | ${7.55}       | ${'bellow'} | ${false}
    ${6.75}     | ${6.74}     | ${6.66}       | ${'bellow'} | ${false}
    ${99}       | ${98}       | ${95}         | ${'bellow'} | ${false}
  `('it should not re-notify when $actualPrice (actual) > $targetPrice (target) and also $previousPrice (previous) > $targetPrice (target) trigger is $trigger and repeat is $repeat', ({targetPrice, actualPrice, previousPrice, trigger, repeat}) => {
    const ticker = "TAEE4"
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

    expect(notificationServiceSpy)
    .not.toBeCalled()
  })

  test.each`
    targetPrice | actualPrice |  trigger     | repeat
    ${8}        | ${8}        |  ${'above'}  | ${false}
    ${8}        | ${8}        |  ${'above'}  | ${true}
    ${100.01}   | ${100.01}   |  ${'above'}  | ${undefined}
    ${200}      | ${200}      |  ${undefined}| ${undefined}
    ${7.50}     | ${7.50}     |  ${'bellow'} | ${false}
    ${6.75}     | ${6.75}     |  ${'bellow'} | ${false}
    ${99}       | ${99}       |  ${'bellow'} | ${true}
  `('it should not notify when $actualPrice (actual) == $targetPrice (target)', ({targetPrice, actualPrice, trigger, repeat}) => {
    const ticker = "PAGS34"
    const condition = { ticker: ticker, trigger: trigger, price: targetPrice, repeat: repeat }

    stockService.getPricesByTicker.mockImplementation(() => [
      {price: 8.08, date: "13/12/21 10:00"},
      {price: 8.00, date: "13/12/21 10:10"},
      {price: 7.94, date: "13/12/21 10:30"},
      {price: 10.9, date: "13/12/21 10:40"},
      {price: actualPrice, date: "13/12/21 10:50"}
    ])

    processConditions([condition])

    expect(stockService.getPricesByTicker)
    .toHaveBeenCalledWith(ticker)

    expect(notificationServiceSpy)
    .not.toBeCalled()
  })

  test('it should not notify if prices data is empty', () => {
    const ticker = "TAEE4"
    const condition = { ticker: ticker, price: 8}

    stockService.getPricesByTicker.mockImplementation(() => [])

    processConditions([condition])

    expect(stockService.getPricesByTicker)
    .toHaveBeenCalledWith(ticker)

    expect(notificationServiceSpy)
    .not.toBeCalled()
  })
})