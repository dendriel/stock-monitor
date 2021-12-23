const { processConditions } = require('./stock-monitor')
const configurationService = require('./service/configuration.service')

exports.handler = async (event) => {
//    console.log(JSON.stringify(event))


    let config = getConfiguration()
    processConditions(config)

    return { statusCode: 200 };
};

function getConfiguration() {
    // GET from S3
    let config = [
      {ticker: "AERI3", trigger:"bellow", price: 6.95 },
      {ticker: "AERI3", price: 8 },
      {ticker: "TAEE4", trigger:"bellow", price: 11.50 },
      {ticker: "TAEE4", trigger:"bellow", price: 11.30, repeat: true }
    ]
  
    return config
  }
