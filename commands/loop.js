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

    const mode =
        interaction.options.getString(
            "mode"
        );

    player.setLoopMode(
        guildPlayer,
        mode
    );

    const messages = {
        off: "🔁 Повтор вимкнено.",
        track: "🔂 Поточний трек повторюється.",
        queue: "🔁 Черга буде повторюватися."
    };

    await interaction.reply(
        messages[mode]
    );
}

module.exports = {
    execute
};