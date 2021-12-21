
function sendNotification(notification) {
  // publish notification
  console.log(`Sending notification... ${notification}`)
}

exports.notificationService = {
  sendNotification: sendNotification
}