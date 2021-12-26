resource "aws_sns_topic" "this" {
  name = var.topic

  tags = {
    Name        = "Stock Monitor"
    Environment = "prod"
  }
}

resource "aws_sns_topic_subscription" "target_email" {
  topic_arn = aws_sns_topic.this.arn
  protocol  = "email"
  endpoint  = var.email_subscriber
}
