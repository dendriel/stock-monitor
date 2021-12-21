const { monitor } = require('./stock-monitor')

exports.handler = async (event) => {
    console.log(JSON.stringify(event))


    let config = getConfiguration()
    monitor(config)

    return { statusCode: 200 };
};

function getConfiguration() {
    // GET from S3
    let config = [
      {ticker: "AERI3", trigger:"bellow", baseline: 6.95 },
      {ticker: "AERI3", baseline: 8 },
      {ticker: "TAEE4", trigger:"bellow", baseline: 11.50 },
      {ticker: "TAEE4", trigger:"bellow", baseline: 11.30, repeat: true }
    ]
  
    return config
  }
