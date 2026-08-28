const player = require("../services/player");

async function execute(interaction) {

    const guildPlayer =
        player.getGuildPlayer(
            interaction.guild.id
        );

    if (
        !guildPlayer ||
        !guildPlayer.currentTrack
    ) {

        await interaction.reply(
            "❌ Зараз нічого не грає."
        );

        return;
    }

    const title =
        guildPlayer.currentTrack.title;

    await player.restart(
        guildPlayer
    );

    await interaction.reply(
        `🔄 Перезапущено: **${title}**`
    );
}

module.exports = {
    execute
};