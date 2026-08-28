const {
    joinVoiceChannel,
    createAudioPlayer,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    NoSubscriberBehavior
} = require("@discordjs/voice");
const {
    getStreamUrl
} = require("./audius");
const {
    createAudioResourceFromUrl
} = require("./audio");

const guildPlayers = new Map();


// ======================================================
// GET PLAYER
// ======================================================

function getGuildPlayer(guildId) {
    return guildPlayers.get(guildId);
}


// ======================================================
// CREATE PLAYER
// ======================================================

function createGuildPlayer(guild, voiceChannel) {
    let guildPlayer = guildPlayers.get(guild.id);

    // Player already exists
    if (guildPlayer) {

        // Move bot to another voice channel
        if (guildPlayer.voiceChannelId !== voiceChannel.id) {

            cleanupCurrentStream(guildPlayer);

            guildPlayer.connection.destroy();

            guildPlayer.connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator
            });

            guildPlayer.voiceChannelId = voiceChannel.id;

            guildPlayer.connection.subscribe(
                guildPlayer.player
            );
        }

        return guildPlayer;
    }


    // ==================================================
    // VOICE CONNECTION
    // ==================================================

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
    });


    // ==================================================
    // AUDIO PLAYER
    // ==================================================

    const audioPlayer = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
    });

    connection.subscribe(audioPlayer);


    // ==================================================
    // GUILD PLAYER STATE
    // ==================================================

    guildPlayer = {
        guildId: guild.id,
        voiceChannelId: voiceChannel.id,

        connection,
        player: audioPlayer,

        queue: [],
        currentTrack: null,

        history: [],

        loopMode: "off",

        currentProcess: null,
        currentStream: null,

        // Identifies the currently active playback
        playbackId: 0,

        // Prevents Idle from processing
        // skip / previous / restart / stop
        ignoreNextIdle: false
    };


    guildPlayers.set(
        guild.id,
        guildPlayer
    );


    // ==================================================
    // CONNECTION EVENTS
    // ==================================================

    connection.on(
        VoiceConnectionStatus.Ready,
        () => {
            console.log(
                `✅ Voice connection READY: ${guild.name}`
            );
        }
    );

    connection.on(
        VoiceConnectionStatus.Disconnected,
        () => {
            console.log(
                `⚠️ Voice connection DISCONNECTED: ${guild.name}`
            );
        }
    );


    // ==================================================
    // PLAYER PLAYING
    // ==================================================

    audioPlayer.on(
        AudioPlayerStatus.Playing,
        () => {

            console.log(
                `▶️ PLAYING: ${
                    guildPlayer.currentTrack?.title ||
                    "Unknown"
                }`
            );
        }
    );


    // ==================================================
    // PLAYER IDLE
    // ==================================================

    audioPlayer.on(
        AudioPlayerStatus.Idle,
        async () => {

            console.log("⏹️ Player IDLE");

            const finishedTrack =
                guildPlayer.currentTrack;


            // Nothing was playing
            if (!finishedTrack) {
                return;
            }


            // Check whether Idle should be ignored
            const ignoreIdle =
                guildPlayer.ignoreNextIdle;

            guildPlayer.ignoreNextIdle = false;


            // Cleanup current stream
            cleanupCurrentStream(
                guildPlayer
            );


            // ==================================================
            // IGNORE IDLE
            // ==================================================

            if (ignoreIdle) {
                return;
            }


            // ==================================================
            // LOOP CURRENT TRACK
            // ==================================================

            if (
                guildPlayer.loopMode === "track"
            ) {

                await playTrack(
                    guildPlayer,
                    finishedTrack,
                    false
                );

                return;
            }


            // ==================================================
            // ADD TO HISTORY
            // ==================================================

            addToHistory(
                guildPlayer,
                finishedTrack
            );


            // ==================================================
            // LOOP QUEUE
            // ==================================================

            if (
                guildPlayer.loopMode === "queue"
            ) {

                guildPlayer.queue.push(
                    finishedTrack
                );
            }


            guildPlayer.currentTrack = null;


            // ==================================================
            // PLAY NEXT
            // ==================================================

            playNext(
                guildPlayer
            );
        }
    );


    // ==================================================
    // PLAYER ERROR
    // ==================================================

    audioPlayer.on(
        "error",
        error => {

            console.error(
                "❌ Player error:",
                error
            );

            cleanupCurrentStream(
                guildPlayer
            );

            guildPlayer.currentTrack = null;

            playNext(
                guildPlayer
            );
        }
    );


    return guildPlayer;
}


// ======================================================
// PLAY TRACK
// ======================================================

async function playTrack(
    guildPlayer,
    track,
    addHistory = false
) {
    const playbackId =
        ++guildPlayer.playbackId;

    try {

        // ==============================================
        // CLEANUP PREVIOUS STREAM
        // ==============================================

        cleanupCurrentStream(
            guildPlayer
        );


        // ==============================================
        // CHECK TRACK
        // ==============================================

        if (!track || !track.id) {

            console.log(
                "❌ Track has no ID"
            );

            playNext(
                guildPlayer
            );

            return;
        }


        console.log(
            `🔊 Starting stream: ${track.title}`
        );


        // ==============================================
        // GET FRESH STREAM URL
        // ==============================================

        const streamUrl =
            await getStreamUrl(track.id);


        if (!streamUrl) {

            console.log(
                `❌ No stream URL for: ${track.title}`
            );

            playNext(
                guildPlayer
            );

            return;
        }


        // ==============================================
        // CHECK WHETHER ANOTHER TRACK STARTED
        // ==============================================

        if (
            playbackId !==
            guildPlayer.playbackId
        ) {
            return;
        }


        // ==============================================
        // CREATE AUDIO RESOURCE
        // ==============================================

        const resource =
            await createAudioResourceFromUrl(
                streamUrl,
                guildPlayer
            );


        // ==============================================
        // CHECK AGAIN
        // ==============================================

        if (
            playbackId !==
            guildPlayer.playbackId
        ) {

            cleanupCurrentStream(
                guildPlayer
            );

            return;
        }


        // ==============================================
        // SET CURRENT TRACK
        // ==============================================

        guildPlayer.currentTrack =
            track;


        // ==============================================
        // HISTORY
        // ==============================================

        if (addHistory) {

            addToHistory(
                guildPlayer,
                track
            );
        }


        // ==============================================
        // PLAY
        // ==============================================

        guildPlayer.player.play(
            resource
        );

    } catch (error) {

        console.error(
            "❌ Track playback error:",
            error.message
        );


        cleanupCurrentStream(
            guildPlayer
        );


        // Якщо цей playback вже не актуальний,
        // не запускаємо наступний трек
        if (
            playbackId !==
            guildPlayer.playbackId
        ) {
            return;
        }


        guildPlayer.currentTrack =
            null;


        playNext(
            guildPlayer
        );
    }
}

// ======================================================
// PLAY NEXT
// ======================================================

function playNext(guildPlayer) {

    if (
        guildPlayer.queue.length === 0
    ) {

        console.log(
            "📭 Queue is empty"
        );

        return;
    }


    const nextTrack =
        guildPlayer.queue.shift();


    playTrack(
        guildPlayer,
        nextTrack
    );
}


// ======================================================
// QUEUE
// ======================================================

function addToQueue(
    guildPlayer,
    track
) {

    guildPlayer.queue.push(
        track
    );
}


// ======================================================
// SKIP
// ======================================================

function skip(guildPlayer) {

    if (
        !guildPlayer.currentTrack
    ) {

        return false;
    }


    const currentTrack =
        guildPlayer.currentTrack;


    // Add skipped track to history
    addToHistory(
        guildPlayer,
        currentTrack
    );


    // Create new playback ID
    // so old playback becomes invalid
    guildPlayer.playbackId++;


    // Prevent Idle from processing
    // the skipped track again
    guildPlayer.ignoreNextIdle = true;


    // Cleanup stream
    cleanupCurrentStream(
        guildPlayer
    );


    guildPlayer.currentTrack = null;


    // Stop current audio
    guildPlayer.player.stop();


    // Play next track
    if (
        guildPlayer.queue.length > 0
    ) {

        const nextTrack =
            guildPlayer.queue.shift();


        playTrack(
            guildPlayer,
            nextTrack
        );
    }


    return true;
}


// ======================================================
// PAUSE
// ======================================================

function pause(guildPlayer) {

    return guildPlayer.player.pause();
}


// ======================================================
// RESUME
// ======================================================

function resume(guildPlayer) {

    return guildPlayer.player.unpause();
}


// ======================================================
// STOP
// ======================================================

function stop(guildPlayer) {

    // Invalidate current playback
    guildPlayer.playbackId++;


    guildPlayer.queue = [];

    guildPlayer.currentTrack = null;

    guildPlayer.ignoreNextIdle = true;


    cleanupCurrentStream(
        guildPlayer
    );


    guildPlayer.player.stop();
}


// ======================================================
// RESTART
// ======================================================

async function restart(guildPlayer) {

    if (
        !guildPlayer.currentTrack
    ) {

        return false;
    }


    const track =
        guildPlayer.currentTrack;


    console.log(
        `🔄 Restarting: ${track.title}`
    );


    // Invalidate previous playback
    guildPlayer.playbackId++;


    // Do not add restarted track to history
    guildPlayer.ignoreNextIdle = true;


    cleanupCurrentStream(
        guildPlayer
    );


    guildPlayer.currentTrack = null;


    // Stop current audio
    guildPlayer.player.stop();


    // Start track again
    await playTrack(
        guildPlayer,
        track,
        false
    );


    return true;
}


// ======================================================
// PREVIOUS
// ======================================================

async function previous(guildPlayer) {

    if (
        guildPlayer.history.length === 0
    ) {

        return false;
    }


    const previousTrack =
        guildPlayer.history.pop();


    if (!previousTrack) {
        return false;
    }


    // Put current track back into queue
    if (
        guildPlayer.currentTrack
    ) {

        guildPlayer.queue.unshift(
            guildPlayer.currentTrack
        );
    }


    // Invalidate current playback
    guildPlayer.playbackId++;


    // Prevent Idle from processing
    // current track again
    guildPlayer.ignoreNextIdle = true;


    cleanupCurrentStream(
        guildPlayer
    );


    guildPlayer.currentTrack = null;


    guildPlayer.player.stop();


    // Play previous track
    await playTrack(
        guildPlayer,
        previousTrack,
        false
    );


    return true;
}


// ======================================================
// SHUFFLE
// ======================================================

function shuffle(guildPlayer) {

    const queue =
        guildPlayer.queue;


    // Fisher-Yates shuffle
    for (
        let i = queue.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            queue[i],
            queue[j]
        ] = [
            queue[j],
            queue[i]
        ];
    }


    return queue;
}


// ======================================================
// LOOP
// ======================================================

function setLoopMode(
    guildPlayer,
    mode
) {

    const modes = [
        "off",
        "track",
        "queue"
    ];


    if (
        !modes.includes(mode)
    ) {

        return false;
    }


    guildPlayer.loopMode =
        mode;


    return true;
}


// ======================================================
// HISTORY
// ======================================================

function addToHistory(
    guildPlayer,
    track
) {

    if (!track) {
        return;
    }


    guildPlayer.history.push(
        track
    );


    // Maximum 50 tracks
    if (
        guildPlayer.history.length > 50
    ) {

        guildPlayer.history.shift();
    }
}


function getHistory(guildPlayer) {

    return [
        ...guildPlayer.history
    ];
}


// ======================================================
// DISCONNECT
// ======================================================

function disconnect(guildId) {

    const guildPlayer =
        guildPlayers.get(guildId);


    if (!guildPlayer) {
        return;
    }


    // Invalidate playback
    guildPlayer.playbackId++;


    cleanupCurrentStream(
        guildPlayer
    );


    guildPlayer.player.stop();


    guildPlayer.connection.destroy();


    guildPlayers.delete(
        guildId
    );
}


// ======================================================
// CLEANUP STREAM
// ======================================================

function cleanupCurrentStream(guildPlayer) {

    // ==============================================
    // HTTP STREAM
    // ==============================================

    if (guildPlayer.currentStream) {

        const stream =
            guildPlayer.currentStream;

        guildPlayer.currentStream =
            null;

        try {

            if (!stream.destroyed) {
                stream.destroy();
            }

        } catch (error) {

            console.error(
                "❌ Stream cleanup error:",
                error.message
            );
        }
    }


    // ==============================================
    // FFMPEG
    // ==============================================

    if (guildPlayer.currentProcess) {

        const process =
            guildPlayer.currentProcess;

        guildPlayer.currentProcess =
            null;

        try {

            if (
                process.stdin &&
                !process.stdin.destroyed
            ) {
                process.stdin.destroy();
            }

            if (!process.killed) {
                process.kill();
            }

        } catch (error) {

            console.error(
                "❌ FFmpeg cleanup error:",
                error.message
            );
        }
    }
}


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    getGuildPlayer,
    createGuildPlayer,

    playTrack,
    addToQueue,

    skip,
    pause,
    resume,
    stop,

    restart,
    previous,

    shuffle,

    setLoopMode,

    getHistory,

    disconnect
};