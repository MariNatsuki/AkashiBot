import Discord from 'discord.js'

export interface Message extends Discord.Message {
  command?: UserCommand
}

interface UserCommand {
  name: string,
  args: string[]
}
