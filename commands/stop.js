const player = require("../services/player");

async function execute(interaction) {
    const guildPlayer = player.getGuildPlayer(
        interaction.guild.id
    );

    if (!guildPlayer) {
        await interaction.reply(
            "❌ Музика зараз не запущена."
        );
        return;
    }

    player.stop(guildPlayer);

    await interaction.reply(
        "⏹️ Музика зупинена, чергу очищено."
    );
}

module.exports = {
    execute
};