const player = require("../services/player");

async function execute(interaction) {
    const guildPlayer = player.getGuildPlayer(
        interaction.guild.id
    );

    if (!guildPlayer) {
        await interaction.reply(
            "📭 Черга порожня."
        );
        return;
    }

    player.clearQueue(guildPlayer);

    await interaction.reply(
        "🗑️ Чергу очищено."
    );
}

module.exports = {
    execute
};