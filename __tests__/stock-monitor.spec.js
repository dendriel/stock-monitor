const { test, expect } = require('@jest/globals');
const { monitor } = require('../lambda/stock-monitor')


jest.mock('../lambda/service/stock.service')
const { stockService } = require('../lambda/service/stock.service')


describe("Stock Monitor", () => {

  test("it should notify when actual price is above target price", () => {

    stockService.getPricesByTicker.mockImplementation(() => [])

    const config = [{ ticker: "AERI3", trigger:"above", price: 8, repeat: true }]
    expect(monitor(config))
    .toEqual(undefined)
  })
})