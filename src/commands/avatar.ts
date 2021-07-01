module.exports = {
  name: 'avatar',
  description: 'Get User\'s avatar',
  execute(message, args) {
    message.channel.send(message.author.displayAvatarURL())
  },
}
