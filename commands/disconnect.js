const player = require("../services/player");

async function execute(interaction) {
    const success = player.disconnect(
        interaction.guild.id
    );

    if (!success) {
        await interaction.reply(
            "❌ Бот не знаходиться у голосовому каналі."
        );
        return;
    }

    await interaction.reply(
        "👋 Бот вийшов із голосового каналу."
    );
}

module.exports = {
    execute
};