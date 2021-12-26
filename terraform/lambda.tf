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

// TODO: setup cron trigger from cloud watch

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

resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "vpc" {
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_policy" "s3_get_object" {
  name        = "stock-monitor-s3-get-object"
  description = "Stock Monitor"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["s3:GetObject"],
      "Effect": "Allow",
      "Resource": "${aws_s3_bucket.this.arn}/*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "s3_get_object" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.s3_get_object.arn
}

resource "aws_iam_policy" "sns_publish" {
  name        = "stock-monitor-sns-publish"
  description = "Stock Monitor"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["sns:Publish"],
      "Effect": "Allow",
      "Resource": "${aws_sns_topic.this.arn}"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "sns_publish" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.sns_publish.arn
}

resource "aws_cloudwatch_log_group" "this" {
  name = "/aws/lambda/${aws_lambda_function.this.function_name}"

  retention_in_days = 30
}

data "archive_file" "code" {
  type = "zip"

  source_dir  = "${path.module}/../stock-monitor"
  output_path = "${path.module}/stock-monitor.zip"
  excludes    = [ "../stock-monitor/nodejs" ]

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

resource "aws_lambda_layer_version" "modules" {
  filename   = "nodejs.zip"
  layer_name = "stock-monitor-modules"

  compatible_runtimes = ["nodejs14.x"]

  depends_on = [
    data.archive_file.modules
  ]
}

data "archive_file" "modules" {
  type = "zip"

  source_dir  = "${path.module}/../stock-monitor/nodejs"
  output_path = "${path.module}/nodejs.zip"

  depends_on = [
    null_resource.modules
  ]
}

resource "null_resource" "modules" {
  provisioner "local-exec" {
    command = "cd ${path.module}/../stock-monitor/nodejs && npm install"
  }

  triggers = {
    package = sha256(file("${path.module}/../stock-monitor/nodejs/package.json"))
    lock = sha256(file("${path.module}/../stock-monitor/nodejs/package-lock.json"))
  }
}
