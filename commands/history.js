const player = require("../services/player");

async function execute(interaction) {

    const guildPlayer =
        player.getGuildPlayer(
            interaction.guild.id
        );

    if (
        !guildPlayer ||
        guildPlayer.history.length === 0
    ) {

        await interaction.reply(
            "📭 Історія порожня."
        );

        return;
    }

    const history =
        player.getHistory(
            guildPlayer
        );

    const text =
        history
            .slice(0, 10)
            .map(
                (track, index) =>
                    `${index + 1}. ${track.title}`
            )
            .join("\n");

    await interaction.reply(
        `📜 **Історія прослуховування**\n\n${text}`
    );
}

module.exports = {
    execute
};