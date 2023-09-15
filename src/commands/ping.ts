import i18next from 'i18next';

const Command: DiscordType.ICommand = {
  usages: ['ping'],
  execute: async ({ client, message }) => {
    message.channel.send(i18next.t('tr:test2.yazi'));
  },
};

export default Command;
