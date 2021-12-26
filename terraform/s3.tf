resource "aws_s3_bucket" "stock-monitor" {
  bucket = var.bucket
  acl    = "private"

  tags = {
    Name        = "Stock Monitor"
    Environment = "prod"
  }
}

resource "aws_s3_bucket_object" "conditions" {
  bucket = aws_s3_bucket.stock-monitor.bucket
  key    = var.config_key
  source = var.config_source

  etag = filemd5(var.config_source)

  depends_on = [
    aws_s3_bucket.stock-monitor
  ]
}

