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

    const success = player.resume(guildPlayer);

    if (!success) {
        await interaction.reply(
            "❌ Музика вже грає."
        );
        return;
    }

    await interaction.reply(
        "▶️ Музика продовжена."
    );
}

module.exports = {
    execute
};