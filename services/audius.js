const axios = require("axios");

const AUDIUS_API = "https://api.audius.co/v1";

const headers = {
    "x-api-key": process.env.AUDIUS_API_KEY
};


// ======================================================
// SEARCH TRACKS
// ======================================================

async function searchTracks(query, limit = 5) {

    const response = await axios.get(
        `${AUDIUS_API}/tracks/search`,
        {
            params: {
                query,
                limit
            },
            headers
        }
    );

    return response.data.data || [];
}


// ======================================================
// SEARCH ONE TRACK
// ======================================================

async function searchTrack(query) {

    const tracks = await searchTracks(
        query,
        1
    );

    return tracks[0] || null;
}


// ======================================================
// GET STREAM URL
// ======================================================

async function getStreamUrl(trackId) {

    const response = await axios.get(
        `${AUDIUS_API}/tracks/${trackId}/stream`,
        {
            headers,

            maxRedirects: 0,

            validateStatus: status =>
                status >= 200 &&
                status < 400
        }
    );

    return response.headers.location || null;
}


module.exports = {
    searchTrack,
    searchTracks,
    getStreamUrl
};