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

  source_dir  = "${path.module}/../stock-monitor-modules"
  output_path = "${path.module}/nodejs.zip"

  depends_on = [
    null_resource.modules
  ]
}

resource "null_resource" "modules" {
  provisioner "local-exec" {
    command = "cd ${path.module}/../stock-monitor-modules/nodejs && npm install"
  }

  triggers = {
    package = sha256(file("${path.module}/../stock-monitor-modules/nodejs/package.json"))
    lock = sha256(file("${path.module}/../stock-monitor-modules/nodejs/package-lock.json"))
  }
}
