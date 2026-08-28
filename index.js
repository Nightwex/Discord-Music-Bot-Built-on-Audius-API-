require("dotenv").config();

const {
    Client,
    GatewayIntentBits
} = require("discord.js");

const commands = {
    play: require("./commands/play"),
    pause: require("./commands/pause"),
    resume: require("./commands/resume"),
    stop: require("./commands/stop"),
    skip: require("./commands/skip"),
    queue: require("./commands/queue"),
    clear: require("./commands/clear"),
    disconnect: require("./commands/disconnect"),
    nowplaying: require("./commands/nowplaying"),
    loop: require("./commands/loop"),
    shuffle: require("./commands/shuffle"),
    restart: require("./commands/restart"),
    previous: require("./commands/previous"),
    search: require("./commands/search"),
    history: require("./commands/history")
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once("clientReady", () => {
    console.log(
        `🤖 Bot ${client.user.tag} is online!`
    );
});

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = commands[interaction.commandName];

    if (!command) {
        return;
    }

    try {

        await command.execute(interaction);

    } catch (error) {

        console.error(
            `❌ Command error [/${interaction.commandName}]:`,
            error
        );

        const message = "❌ Сталася помилка під час виконання команди.";

        if (interaction.replied || interaction.deferred) {

            await interaction.editReply(message).catch(() => {});

        } else {

            await interaction.reply(message).catch(() => {});
        }
    }
});
client.login(process.env.DISCORD_TOKEN);