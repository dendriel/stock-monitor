# Stock Monitor
Stock Monitor polls the Stock Data Provider regularly to retrieve target stock price data based on a configuration 
stored on S3. Each stock price is tested against defined price threshold and when the condition is meet a message is 
sent to subscribers via SNS.

## Informational Message

The message sent to users when a condition is meet has the following format:

```shell
Stock <ticker> reached the price R$<actual-price> at <date-time>.
Conditional: <bellow|above>
Price: <target-price>
```

## Configuration

Stock monitoring is based on conditions which have the following attributes:

```
{
  "ticker": "<stock-ticker>",
  "trigger": "<bellow|above (default)>",
  "price": <target-price>,
  "repeat": <true|false (default)>
}
```

- **ticker** - stock ticker
- **trigger** - type of condition that triggers this condition
  - *above* (default) - trigger if stock price is above target price
  - *bellow* - trigger if stock price is bellow target price
- **price** - target stock price used to compare against trigger price
- **repeat** - resend notifications if condition keeps being meet in consecutive executions. Default is *false* to 
  don't repeat

A monitoring configuration file stored in S3 is just a set of conditions:

```json
[
  {"ticker": "AERI3", "trigger":"bellow", "price": 6.95 },
  {"ticker": "AERI3", "price": 8 },
  {"ticker": "TAEE4", "trigger":"bellow", "price": 11.50 },
  {"ticker": "TAEE4", "trigger":"bellow", "price": 11.30, "repeat": true }
]
```

## Architecture

### Sketch

![Config Creator Architecture](doc/stock_monitor_arch.png)

The solution has the following components:
- **Stock Data Provider** - third party provider from which stock price data is retrieved
- **S3 bucket** - where configuration used in the monitoring is stored
- **SNS topic** - provides a way to notify users (subscribers) when a price change triggers some condition
- **Lambda function** - glue together all services and runs the solution logic to test stock prices against conditions

### Expanded

![Config Creator Architecture](doc/stock_monitor_arch_expanded.png)

*Obs.:* I've Opted to use a NAT Gateway instead of VPC endpoints because lambda would need an internet connection to 
the Stock data provider anyway.

## Solution Flowchart

![Config Creator Architecture](doc/stock_monitor_flowchart.png)

1. **Get CFG from S3** - retrieve monitoring configuration from S3 bucket
2. **If there is no conditions** to test, just **finish**;
3. **If there is conditions** to test, **pick one** from the configuration;
4. **Get target Stock Data from provider**
5. Compare most up-to-date stock price data received from provider with price condition from configuration
   * **If condition NOT triggered**, go back to step 2
6. **If condition DID trigger**, check if condition was already triggered in previous execution
   * **If condition NOT triggered previously**, create and publish informational message to SNS
7. **If condition triggered previously**
   * **AND NOT** configured to repeat, go back to step 2
   * **AND** configured to repeat, create and publish information message to SNS


## Environment

The following configuration may be set as environment variables:

- **TOPIC** - target ARN from SNS topic
  - **MUST** be specified as there is no default value.
- **BUCKET** - S3 bucket to look for configuration
  - _default_: `stock-monitor`
- **CONFIG** - key to look configuration file inside bucket (may be a full file path)
  - _default_: `conditions.json`
- **REGION** - S3 bucket region
  - _default_: `sa-east-1`
- **PRICES_PROVIDER_URL** - Stock data provider URL in the format `protocol + hostname`
  - _default_: `https://statusinvest.com.br`
- **PRICES_PROVIDER_USER_AGENT** - user agent when requesting data from stock data provider
  - _default_: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36`

## Run Locally

Execute unit tests:
```shell
npm test
```

Execute the function locally, but using real resources:
```shell
npm start
```
To execute locally you must setup:

- An AWS SNS Topic and configure the environment variable **TOPIC** with the topic ARN
- An AWS S3 Bucket that can be specified via environement variables **BUCKET** and **CONFIG**
- Setup the AWS credentials so the local running function can use AWS resources

### AWS Credentials
When running locally, this service depends on AWS credentials file located in the user home to be allowed to
s3:GetObject from S3 and sns:Publish to SNS.

Check AWS docs on 
how to setup the credentials: https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html
