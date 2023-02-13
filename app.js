require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const SpotifyWebApi = require('spotify-web-api-node');
const path = require('path')

// require spotify-web-api-node package here:

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
hbs.registerPartials(path.join(__dirname, 'views', 'partials'))

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });
  
// Retrieve an access token
spotifyApi
.clientCredentialsGrant()
.then(data => {
    spotifyApi.setAccessToken(data.body['access_token']);

})
.catch(error => console.log('Something went wrong when retrieving an access token', error))

// Our routes go here:
app.get('/', (req, res, next)=>{
    res.render('index');
})

app.get('/artist-search', async (req, res, next) => {
    try {
        const {body: {artists: {items: artists}}} = await spotifyApi.searchArtists(req.query.artist);

        res.render('artist-search-result', {artists})

    } catch (error) {
        console.log('Error occurred while searching for artist')
        next(error)
    }
})

app.get('/albums/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const {body: {items: albums}} = await spotifyApi.getArtistAlbums(id);

        res.render('albums', {albums})

    } catch (error) {
        console.log('Error occurred while looking up albums');
        next(error);
    }
})

app.get('/tracks/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const {body: {items: tracks}} = await spotifyApi.getAlbumTracks(id);

        res.render('tracks', {tracks})

    } catch (error) {
        console.log('Error occurred while looking up tracks')
    }
})



app.use((error, req, res, next) => {
    console.log(error);
    res.render('error', {error});
})

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
