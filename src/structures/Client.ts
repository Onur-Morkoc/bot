import { config } from '@config';
import { ActivityType, Collection, Client as Core, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'fs';
import { map } from 'lodash';
import { connect } from 'mongoose';
import { resolve } from 'path';

export class Client extends Core {
  commands = new Collection<string, DiscordType.ICommand>();

  constructor() {
    super({
      intents: Object.keys(GatewayIntentBits).map((intent) => GatewayIntentBits[intent]),
      presence: { activities: [{ name: '', type: ActivityType.Watching }] },
    });
  }

  private async loadCommands() {
    const files = readdirSync(resolve(__dirname, '..', 'commands'));

    await Promise.all(
      map(files, async (fileName) => {
        const command = (await import(resolve(__dirname, '..', 'commands', fileName)))
          .default as DiscordType.ICommand;
        this.commands.set(command.usages[0], command);
      }),
    );
  }

  private async loadEvents() {
    const files = readdirSync(resolve(__dirname, '..', 'events'));

    await Promise.all(
      map(files, async (fileName) => {
        const event: any = (await import(resolve(__dirname, '..', 'events', fileName)))
          .default as DiscordType.IEvent;

        this.on(event.name, (...args: unknown[]) => event.execute(this, [...args]));
      }),
    );
  }

  async connect() {
    //connect(config.DBACCESS)
    await Promise.all([this.loadCommands(), this.loadEvents()]);

    await this.login(config.BOT_TOKEN);
  }
}
