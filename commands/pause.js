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

    const success = player.pause(guildPlayer);

    if (!success) {
        await interaction.reply(
            "❌ Музика вже призупинена."
        );
        return;
    }

    await interaction.reply(
        "⏸️ Музика призупинена."
    );
}

module.exports = {
    execute
};