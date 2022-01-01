resource "aws_lambda_function" "this" {
  filename      = "stock-monitor.zip"
  function_name = "stock-monitor"
  role          = aws_iam_role.this.arn
  handler       = "index.handler"
  timeout       = 10

  source_code_hash = data.archive_file.code.output_base64sha256

  runtime = "nodejs14.x"

  layers = [aws_lambda_layer_version.modules.arn]

  environment {
    variables = {
      TOPIC = aws_sns_topic.this.arn,
      BUCKET = aws_s3_bucket.this.bucket,
      CONFIG = var.config_key,
      REGION = var.region,
      PRICES_PROVIDER_URL = var.prices_provider.url,
      PRICES_PROVIDER_USER_AGENT = var.prices_provider.user_agent
    }
  }

  vpc_config {
    subnet_ids         = module.vpc.private_subnets
    security_group_ids = [aws_security_group.this.id]
  }

  depends_on = [
    data.archive_file.code
  ]

  tags = {
    terraform = "true"
    environment = "prod"
  }
}

resource "aws_security_group" "this" {
  name        = "Stock Monitor"
  description = "Egress Only"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    terraform = "true"
    environment = "prod"
  }
}

resource "aws_iam_role" "this" {
  name = "stock-monitor"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_cloudwatch_log_group" "this" {
  name = "/aws/lambda/${aws_lambda_function.this.function_name}"
  retention_in_days = 30
}

data "archive_file" "code" {
  type = "zip"

  source_dir  = "${path.module}/../stock-monitor"
  output_path = "${path.module}/stock-monitor.zip"

  depends_on = [
    null_resource.code
  ]
}

resource "null_resource" "code" {

  triggers = {
    index = sha256(file("${path.module}/../stock-monitor/index.js"))
    handler = sha256(file("${path.module}/../stock-monitor/stock-monitor.js"))
    service = sha256(join("",fileset(path.module, "../stock-monitor/service/*.js")))
  }
}
