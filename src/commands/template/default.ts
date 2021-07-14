import { Message } from 'discord.js'
import { Command, CommandExecutionResult } from '../../types/command'

module.exports = {
  name: '',                             // Command's name, used together with prefix to trigger this command via discord message
  aliases: [],                          // Command aliases, allow command to be triggered by multiple word
  description: '',                      // Displayed to end user when using command <prefix>describe
  notifyAuthor: false,                  // Enable posting/editing bot message based on command processing status
  notificationCallback: {               // Callback function to be used when notifyAuthor = true
    preprocess(message: Message, replied?: Promise<Message>): Promise<Message> {
      const msg = `${message.author} Processing your command, please wait...`
      return replied ? Promise.resolve(replied).then(rpl => rpl.edit(msg)) : message.channel.send(msg)
    },
    success(message: Message, replied?: Promise<Message>, result?: CommandExecutionResult): Promise<Message> {               // Called when return status = true
      return replied
    },
    failed(message: Message, replied?: Promise<Message>, result?: CommandExecutionResult): Promise<Message> {                // Called when return status = false or exception occurred
      const msg = `${message.author} Your command failed to process, please check if it's in correct format and try again!`
      return replied ? Promise.resolve(replied).then(rpl => rpl.edit(msg)) : message.channel.send(msg)
    }
  },
  guildOnly: true,                      // Only allow this command to be used inside servers (Direct Message is prohibited)
  args: false,                          // Determine if this command require argument or not
  usage: '<arg1> <arg2>',               // Use together with 'args' option, display to user when args is require and they didn't provide any
  async execute(message: Message, args: string[], replied?: Promise<Message>) {        // Main execution function, will be called when user provide this command's correct format
    return { status: true }
  },
} as Command
