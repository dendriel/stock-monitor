const Axios = require('axios')

const restUrl = process.env.PRICES_PROVIDER_URL || 'https://statusinvest.com.br'
const userAgent = process.env.PRICESS_PROVIVER_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36'

const axiosInstance = Axios.create({
    baseURL: restUrl,
    headers: {
        'Accept': 'application/json',
        'User-Agent': userAgent
    }
});

exports.restService = {
    api: axiosInstance,
}
