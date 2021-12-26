region = "sa-east-1"
bucket = "stock-monitor"
config_key = "conditions.json"
config_source = "../conditions.json"
topic = "stock-monitor-notifications"
prices_provider = {
  url        = "https://statusinvest.com.br"
  user_agent = null
}
