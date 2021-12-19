# Stock Monitor
Stock Monitor polls the Stock Data Provider regularly to retrieve target stock price data based on a configuration 
stored on S3. Each stock price is tested against defined price threshold and when the condition is meet a message is 
sent to subscribers via SNS.

## Architecture

![Config Creator Architecture](doc/stock_monitor_arch.png)

The solution has the following components:
- **Stock Data Provider** - third party provider from which stock price data is retrieved
- **S3 bucket** - where configuration used in the monitoring is stored
- **SNS topic** - provides a way to notify users (subscribers) when a price change triggers some condition
- **Lambda function** - glue together all services and runs the solution logic to test stock prices against conditions


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