module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "stock-monitor"
  cidr = "10.0.0.0/16"

  azs             = ["sa-east-1a", "sa-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24"]

  enable_dns_hostnames = true
  enable_dns_support   = true

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    terraform = "true"
    environment = "prod"
  }
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = module.vpc.vpc_id
  service_name      = "com.amazonaws.sa-east-1.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = module.vpc.private_route_table_ids
}

resource "aws_vpc_endpoint" "sns" {
  vpc_id              = module.vpc.vpc_id
  service_name        = "com.amazonaws.sa-east-1.sns"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = module.vpc.private_subnets
  private_dns_enabled = true

  security_group_ids = [
    aws_security_group.sns_interface_endpoint.id,
  ]
}

resource "aws_security_group" "sns_interface_endpoint" {
  name        = "SNS Interface Endpoint"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["10.0.0.0/16"]
  }

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
