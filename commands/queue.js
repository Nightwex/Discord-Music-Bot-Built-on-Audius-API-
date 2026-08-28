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

    const current = guildPlayer.currentTrack;
    const queue = guildPlayer.queue;

    if (!current && queue.length === 0) {
        await interaction.reply(
            "📭 Черга порожня."
        );
        return;
    }

    let message = "";

    if (current) {
        message += `▶️ **Зараз грає:** ${current.title}\n\n`;
    }

    if (queue.length > 0) {
        message += "📋 **Черга:**\n";

        queue.forEach((track, index) => {
            message += `${index + 1}. ${track.title}\n`;
        });
    } else {
        message += "📭 Черга порожня.";
    }

    await interaction.reply(message);
}

module.exports = {
    execute
};