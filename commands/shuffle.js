const player = require("../services/player");

async function execute(interaction) {

    const guildPlayer =
        player.getGuildPlayer(
            interaction.guild.id
        );

    if (
        !guildPlayer ||
        guildPlayer.queue.length < 2
    ) {

        await interaction.reply(
            "❌ У черзі недостатньо треків для перемішування."
        );

        return;
    }

    player.shuffle(guildPlayer);

    await interaction.reply(
        "🔀 Чергу перемішано."
    );
}

module.exports = {
    execute
};