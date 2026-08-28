require("dotenv").config();

const {
    searchTrack,
    getStreamUrl
} = require("./services/audius");

async function test() {
    try {
        const track = await searchTrack("Alan Walker Faded");

        console.log("TRACK:");
        console.log(track);

        const streamUrl = await getStreamUrl(track.id);

        console.log("\nSTREAM URL:");
        console.log(streamUrl);
    } catch (error) {
        console.error("ERROR:");

        if (error.response) {
            console.error(error.response.status);
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

test();