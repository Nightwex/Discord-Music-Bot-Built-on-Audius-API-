const { searchTracks } =
    require("../services/audius");

async function execute(interaction) {

    const query =
        interaction.options.getString(
            "query"
        );

    await interaction.deferReply();

    try {

        const tracks =
            await searchTracks(
                query,
                5
            );

        if (!tracks.length) {

            await interaction.editReply(
                "❌ Нічого не знайдено."
            );

            return;
        }

        const text =
            tracks
                .map(
                    (track, index) =>
                        `${index + 1}. **${track.title}** — ${track.user?.name || "Unknown"}`
                )
                .join("\n");

        await interaction.editReply(
            `🔎 **Результати пошуку:**\n\n${text}`
        );

    } catch (error) {

        console.error(
            "❌ SEARCH ERROR:",
            error
        );

        await interaction.editReply(
            "❌ Помилка пошуку."
        );
    }
}

module.exports = {
    execute
};