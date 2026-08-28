require("dotenv").config();

const {
    REST,
    Routes,
    SlashCommandBuilder
} = require("discord.js");

const commands = [
    new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a track from Audius")
        .addStringOption(option =>
            option
                .setName("query")
                .setDescription("Song name or artist")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pause music"),

    new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Resume music"),

    new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skip current track"),

    new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Stop music and clear queue"),

    new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Show music queue"),

    new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear music queue"),

    new SlashCommandBuilder()
        .setName("disconnect")
        .setDescription("Leave voice channel"),

new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Change loop mode")
    .addStringOption(option =>
        option
            .setName("mode")
            .setDescription("Loop mode")
            .setRequired(true)
            .addChoices(
                {
                    name: "Off",
                    value: "off"
                },
                {
                    name: "Track",
                    value: "track"
                },
                {
                    name: "Queue",
                    value: "queue"
                }
            )
    ),

new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Shuffle the queue"),

new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Restart current track"),

new SlashCommandBuilder()
    .setName("previous")
    .setDescription("Play previous track"),

new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search Audius")
    .addStringOption(option =>
        option
            .setName("query")
            .setDescription("Song name or artist")
            .setRequired(true)
    ),

new SlashCommandBuilder()
    .setName("history")
    .setDescription("Show listening history"),

    new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("Show currently playing track")
];

const rest = new REST({ version: "10" })
    .setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
    try {
        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands.map(command =>
                    command.toJSON()
                )
            }
        );

        console.log("✅ Slash commands registered!");
    } catch (error) {
        console.error("❌ Command registration error:", error);
    }
}

deployCommands();