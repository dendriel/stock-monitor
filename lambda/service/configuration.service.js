const { S3Client, GetObjectCommand  } = require("@aws-sdk/client-s3")

const region = process.env.REGION || 'sa-east-1'
const client = new S3Client({ region: region });

const streamToString = (stream) =>
    new Promise((resolve, reject) => {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    })

async function getConfiguration(bucket, file) {
    try {
        const command = new GetObjectCommand({Bucket: bucket, Key: file})
        const { Body } = await client.send(command)
        const data = await streamToString(Body)
        return JSON.parse(data)
    } catch (err) {
        console.log("Failed to get configuration", err);
        throw err
    }
}

exports.configurationService = {
  getConfiguration: getConfiguration
}
