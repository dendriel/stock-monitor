resource "aws_cloudwatch_event_rule" "every_five_minute" {
  name                = "every-five-minute"
  description         = "Fires every five minutes"
  schedule_expression = "rate(${var.interval})"
}

resource "aws_cloudwatch_event_target" "trigger_stock_monitor_every_five_minutes" {
  rule      = aws_cloudwatch_event_rule.every_five_minute.name
  target_id = "stock-monitor-lambda"
  arn       = aws_lambda_function.this.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_stock_monitor" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_five_minute.arn
}
