module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "stock-monitor"
  cidr = "10.0.0.0/16"

  azs             = ["sa-east-1a", "sa-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    terraform = "true"
    environment = "prod"
  }
}
