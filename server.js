const {monitor} = require('./lambda/stock-monitor')

const config = [
  {ticker: "AERI3", trigger:"above", price: 8 },
]

monitor(config)