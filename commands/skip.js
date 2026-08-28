const player = require("../services/player");

async function execute(interaction) {

    const guildPlayer = player.getGuildPlayer(
        interaction.guild.id
    );

    if (!guildPlayer || !guildPlayer.currentTrack) {
        await interaction.reply(
            "❌ Зараз нічого не грає."
        );

        return;
    }

    const skippedTrack = guildPlayer.currentTrack;

    player.skip(guildPlayer);

    await interaction.reply(
        `⏭️ Пропущено: **${skippedTrack.title}**`
    );
}

module.exports = {
    execute
};