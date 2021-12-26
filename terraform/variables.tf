variable region {
  type        = string
  description = "Region in which to deploy the solution"
}

variable bucket {
  type        = string
  description = "S3 configuration's bucket name"
}

variable config_key {
  type        = string
  description = "S3 configuration's key (path from bucket root to configuration file)"
}

variable config_source {
  type        = string
  description = "Filepath to configuration to be deployed"
}

variable topic {
  type        = string
  description = "SNS topic name"
}

variable email_subscriber {
  type        = string
  description = "Target e-mail to receive notifications (must accept subscription via AWS confirmation e-mail)"
}

variable prices_provider {
  type = object({
    url        = string
    user_agent = string
  })
}
