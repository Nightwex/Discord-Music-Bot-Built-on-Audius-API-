const axios = require("axios");
const { spawn } = require("child_process");
const { createAudioResource } = require("@discordjs/voice");

async function createAudioResourceFromUrl(streamUrl, guildPlayer) {
    const audioResponse = await axios.get(streamUrl, {
        responseType: "stream",
        timeout: 15000
    });

    const stream = audioResponse.data;

    guildPlayer.currentStream = stream;

    console.log("🌐 HTTP stream connected");

    stream.on("error", error => {
        console.error(
            "❌ Audius stream error:",
            error.message
        );
    });

    stream.on("end", () => {
        console.log("🌐 Audius stream ended");
    });

    const ffmpeg = spawn("ffmpeg", [
        "-hide_banner",
        "-loglevel",
        "error",

        "-i",
        "pipe:0",

        "-f",
        "s16le",

        "-ar",
        "48000",

        "-ac",
        "2",

        "pipe:1"
    ]);

    guildPlayer.currentProcess = ffmpeg;

    // Важливо:
    // якщо FFmpeg вже закрив stdin, stream.pipe()
    // може спробувати записати туди ще дані.
    ffmpeg.stdin.on("error", error => {
        if (error.code !== "EPIPE") {
            console.error(
                "❌ FFmpeg stdin error:",
                error.message
            );
        }
    });

    ffmpeg.stdout.on("error", error => {
        console.error(
            "❌ FFmpeg stdout error:",
            error.message
        );
    });

    ffmpeg.stderr.on("data", data => {
        const message = data.toString().trim();

        if (message) {
            console.error(`FFmpeg: ${message}`);
        }
    });

    ffmpeg.on("error", error => {
        console.error(
            "❌ FFmpeg process error:",
            error.message
        );
    });

    ffmpeg.on("close", code => {
        console.log(
            `FFmpeg closed with code ${code}`
        );
    });

    stream.pipe(ffmpeg.stdin);

    return createAudioResource(
        ffmpeg.stdout,
        {
            inputType: "raw"
        }
    );
}

module.exports = {
    createAudioResourceFromUrl
};