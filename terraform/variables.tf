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

variable interval {
  type        = string
  description = "Interval between executions. It can be specified both as a rate (ex.: rate(15 minutes)) or cron (ex.: cron(0/10 9-18 ? * MON-FRI *)) expression. https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html"
}

variable prices_provider {
  type = object({
    url        = string
    user_agent = string
  })
}
