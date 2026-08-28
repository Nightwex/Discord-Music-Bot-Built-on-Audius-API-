
const player = require("../services/player");
const { searchTrack } = require("../services/audius");

async function execute(interaction) {

    const member = await interaction.guild.members.fetch(
        interaction.user.id
    );

    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
        await interaction.reply(
            "❌ Спочатку зайди у голосовий канал."
        );
        return;
    }

    const query = interaction.options.getString("query");

    await interaction.deferReply();

    try {

        console.log(`🔎 Searching Audius: ${query}`);

        const track = await searchTrack(query);

        if (!track) {
            await interaction.editReply(
                "❌ Трек не знайдено."
            );
            return;
        }

        if (!track.is_streamable) {
            await interaction.editReply(
                "❌ Цей трек недоступний для стрімінгу."
            );
            return;
        }

        console.log(`🎵 Track: ${track.title}`);
        console.log(`🆔 ID: ${track.id}`);

        const guildPlayer = player.createGuildPlayer(
            interaction.guild,
            voiceChannel
        );

        const isPlaying =
            guildPlayer.currentTrack ||
            guildPlayer.player.state.status === "playing";

        if (isPlaying) {

            player.addToQueue(
                guildPlayer,
                track
            );

            const position =
                guildPlayer.queue.length;

            await interaction.editReply(
                `🎵 **${track.title}**\n📋 Додано в чергу на позицію **${position}**.`
            );

            return;
        }

        await player.playTrack(
            guildPlayer,
            track
        );

        await interaction.editReply(
            `🎵 **${track.title}**\n▶️ Музика запущена!`
        );

    } catch (error) {

        console.error(
            "❌ PLAY ERROR:",
            error
        );

        await interaction.editReply(
            "❌ Не вдалося запустити музику."
        );
    }
}


module.exports = {
    execute
};

