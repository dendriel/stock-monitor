

function getPricesByTicker(ticker) {
  // TODO: hit data provider

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

exports.stockService = {
  getPricesByTicker: getPricesByTicker
}