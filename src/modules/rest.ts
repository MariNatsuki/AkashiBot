import { REST } from 'discord.js';

import { createModule } from '../utils/create-module.ts';

export default createModule(() => {
  const rest = new REST({ version: '9' }).setToken(Bun.env.DISCORD_TOKEN);

  return {
    name: 'Rest',
    provide: {
      rest,
    },
  };
});
