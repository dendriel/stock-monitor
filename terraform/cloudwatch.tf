resource "aws_cloudwatch_event_rule" "stock_monitor_trigger" {
  name                = "stock-monitor-trigger"
  description         = "Fires Stock Monitor Lambda regularly"
  schedule_expression = var.interval

  tags = {
    terraform = "true"
    environment = "prod"
  }
}

resource "aws_cloudwatch_event_target" "trigger_stock_monitor_every_n_minutes" {
  rule      = aws_cloudwatch_event_rule.stock_monitor_trigger.name
  target_id = "stock-monitor-lambda"
  arn       = aws_lambda_function.this.arn
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_stock_monitor" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.stock_monitor_trigger.arn
}
