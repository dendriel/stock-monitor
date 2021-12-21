const {monitor} = require('./stock-monitor')

const config = [
  {ticker: "AERI3", trigger:"bellow", baseline: 6.95 },
  {ticker: "AERI3", baseline: 8 },
  {ticker: "TAEE4", trigger:"bellow", baseline: 11.50 },
  {ticker: "TAEE4", trigger:"bellow", baseline: 11.30, repeat: true }
]

monitor(config)