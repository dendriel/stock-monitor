resource "aws_s3_bucket" "this" {
  bucket = var.bucket
  acl    = "private"

  tags = {
    Name        = "Stock Monitor"
    Environment = "prod"
  }
}

resource "aws_s3_bucket_object" "configuration" {
  bucket = aws_s3_bucket.this.bucket
  key    = var.config_key
  source = var.config_source

  etag = filemd5(var.config_source)

  depends_on = [
    aws_s3_bucket.this
  ]
}

