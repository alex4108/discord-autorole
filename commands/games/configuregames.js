const {Command} = require('discord.js-commando');

module.exports = class GamesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'configure-games',
            aliases: ['set-games', 'enable-games', 'disable-games', 'configure', 'config'],
            group: 'games',
            memberName: 'configure-games',
            description: 'Enables or disables game-tracking/finding services on a server.',
            throttling: {
                usages: 1,
                duration: 5
            },
            guildOnly: true,
            clientPermissions: ['SEND_MESSAGES'],
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'status',
                    prompt: 'Would you like to enable or disable these functions? Type yes/no',
                    type: 'boolean'
                }
            ],
            hidden: true
        });
    }

    // noinspection JSCheckFunctionSignatures
    run(message, {status}) {
        message.client.postgresClient.query(`UPDATE serverconfig
                                             SET gamesservices=$1
                                             WHERE serverid = $2`, [status, message.guild.id])
            .then(res => {
                message.client.serverConfigCache.find(val => {
                    return val.serverid = message.guild.id
                }).gamesservices = status;
                message.client.log(`Updated ${message.guild.name}'s gamesservice status to be ${status ? 'enabled' : 'disabled'}.`);
                let lng = message.client.serverConfigCache.find(val => {
                    return val["serverid"] === message.guild.id
                })["language"];
                return message.say(message.client.i18next.t("gamesServicesUpdate", {
                    "lng": lng,
                    "status": (status ? '✅' : '❌')
                }));

            }).catch(err => {
            let lng = message.client.serverConfigCache.find(val => {
                return val["serverid"] === message.guild.id
            })["language"];
            if (lng === undefined) {
                lng = "en"
            }
            message.client.log(err);
            return message.say(message.client.i18next.t("errorMsg", {"lng": lng}))
        });
    }
};
