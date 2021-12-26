resource "aws_sns_topic" "notifications" {
  name = var.topic

  tags = {
    Name        = "Stock Monitor"
    Environment = "prod"
  }
}

resource "aws_sns_topic_subscription" "email-target" {
  topic_arn = aws_sns_topic.notifications.arn
  protocol  = "email"
  endpoint  = var.email_subscriber
}
