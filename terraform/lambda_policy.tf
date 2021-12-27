resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "vpc" {
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "s3_get_object" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.s3_get_object.arn
}

resource "aws_iam_role_policy_attachment" "sns_publish" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.sns_publish.arn
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
