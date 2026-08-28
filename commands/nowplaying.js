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

    const track = guildPlayer.currentTrack;

    await interaction.reply(
        `🎵 **Зараз грає:** ${track.title}\n` +
        `👤 **Артист:** ${track.user?.name || "Unknown"}`
    );
}

module.exports = {
    execute
};