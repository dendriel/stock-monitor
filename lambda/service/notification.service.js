const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')

const region = process.env.REGION || 'sa-east-1'
const client = new SNSClient({ region: region });

async function sendNotification(topic, notification) {
    console.log(`Sending notification...\n\n${notification}\n`)

    try {
      const command = new PublishCommand({TopicArn: topic, Message: notification})
      const response = await client.send(command)
      console.log(`Notification sent to SNS. Response is: ${JSON.stringify(response)}`)
    } catch(e) {
      console.log(`Failed to send notification. Error: ${e}`)
      throw Error(e)
    }
}

exports.notificationService = {
    sendNotification: sendNotification
}
