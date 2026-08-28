const player = require("../services/player");

async function execute(interaction) {

    const guildPlayer =
        player.getGuildPlayer(
            interaction.guild.id
        );

    if (!guildPlayer) {

        await interaction.reply(
            "❌ Музика ще не запущена."
        );

        return;
    }

    const success =
        await player.previous(
            guildPlayer
        );

    if (!success) {

        await interaction.reply(
            "❌ Попереднього треку немає."
        );

        return;
    }

    await interaction.reply(
        `⏮️ Повертаємось до: **${guildPlayer.currentTrack.title}**`
    );
}

module.exports = {
    execute
};