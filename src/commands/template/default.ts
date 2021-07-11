import { Message } from 'discord.js'

module.exports = {
  name: '',                             // Command's name, used together with prefix to trigger this command via discord message
  description: '',                      // Displayed to end user when using command <prefix>describe
  notifyAuthor: false,                  // React to author's command message about this command's progress (processing, done, failed)
  guildOnly: true,                      // Only allow this command to be used inside servers (Direct Message is prohibited)
  args: false,                          // Determine if this command require argument or not
  usage: '<arg1> <arg2>',               // Use together with 'args' option, display to user when args is require and they didn't provide any
  async execute(message: Message, args: string[]) {        // Main execution function, will be called when user provide this command's correct format
    return { status: true }
  },
}
