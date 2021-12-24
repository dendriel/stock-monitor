const { restService } = require('./rest.service')

async function getPricesByTicker(ticker) {
    console.log(`Requesting prices data for ${ticker} stock.`)
    const { data } = await restService.api.get(`/acao/tickerprice?ticker=${ticker}&type=0&currences%5B%5D=1`)

    if (data === undefined || data.length === 0) {
        throw Error(`Unexpected response from Stock Data Provider: ${data}`)
    }

    return data[0].prices
}

exports.stockService = {
  getPricesByTicker: getPricesByTicker
}
