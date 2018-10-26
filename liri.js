//read and set any environment variables with the dotenv package
require("dotenv").config();

// import keys.js
let keys = require("./keys.js");

// import packages
const request = require('request');
const Spotify = require('node-spotify-api');
const moment = require('moment');
const fs = require('fs');

// get arguments
let type = process.argv[2];
let title = process.argv.slice(3).join(" ");

//Function to get the song information
const getSongData = (song) => {
    // spotify keys
    let spotify = new Spotify(keys.spotify);

    spotify.search({ type: 'track', query: song }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        } else {
            //Print data
            console.log(`Song Name : ${song.toUpperCase()}
                    \nAlbum : ${data.tracks.items[0].album.name}
                    \nArtist : ${data.tracks.items[0].album.artists[0].name}
                    \nURL : ${data.tracks.items[0].album.external_urls.spotify}
                    \n__________________________________________________________`);
            appendData('spotify-this-song', song);
        }
    });
};

//Get movie info
const getMovieData = (title) => {
    let URL = `http://www.omdbapi.com/?t=${title}&plot=short&apikey=trilogy`;
    request(URL, function (error, response, body) {
        if(error) {
            console.log('error:', error);
        } else {
            let result = JSON.parse(body);
            console.log(`Title: ${result.Title}
                \nYear: ${result.Year}
                \nRating: ${result.Rated}
                \nRotten Tomatoes: ${result.Ratings[1].Value}
                \nCountry: ${result.Country}
                \nLanguage: ${result.Language}
                \nPlot: ${result.Plot}
                \nActors: ${result.Actors}
                \n_________________________________________________`);
            appendData('movie-this', title);
        }
    });
};

//Get concert Data
const getConcertData = (artist) => {
    let URL = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`;
    request(URL, function (error, response, body) {
        if (error) {
            console.log('error:', error);
        } else {
            let jsonData = (JSON.parse(body));

            //check if jsonData is an array with events
            if(Array.isArray(jsonData)) {
                if (!(jsonData.length === 0)) {
                    console.log(`Upcoming events for ${artist}:`);
                    for (let i in jsonData) {
                        console.log(`\nVenue : ${jsonData[i].venue.name}
                                \nLocation : ${jsonData[i].venue.city},${jsonData[i].venue.country}
                                \nDate : ${moment(jsonData[i].datetime).format("MM/DD/YYYY")} 
                                \n_______________________________________________________________`);
                    }
                    appendData('concert-this', artist);
                } else {
                    console.log('No upcoming events for ' + artist);    //If there are no upcoming events
                }
            } else {
                console.log('No upcoming events for ' + artist);        //If the response object is not an array with events
            }
        }
    });
};

const appendData = (type, data) => {
    let dataToAppend = `${type},${data}`;
    fs.appendFile('random.txt', dataToAppend + '\n', (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });
};

const getFromTxt = () => {
    fs.readFile("random.txt", "utf8", function (error, data) {
        let mydata = data.split('\n');

        for (let x in mydata) {
            //Split the data to get separate the command arguments
            let items = mydata[x].split(',');
            //switch to get the search type
            switch (items[0]) {
                case 'spotify-this-song':
                    getSongData(items[1]);
                    break;
                case 'movie-this':
                    getMovieData(items[1]);
                    break;
                case 'concert-this':
                    getConcertData(items[1]);
                    break;
                default:
                    break;
            }
        }

    })
};

//Use the type to switch to the appropriate functions
switch (type) {
    case 'spotify-this-song':
        if (!title) {
            title = "The Sign";
        }
        getSongData(title);
        break;
    case 'movie-this':
        if (!title) {
            title = "Born to Race";
        }
        getMovieData(title);
        break;
    case 'concert-this':
        if (!title) {
            title = "The Sign";
        }
        getConcertData(title);
        break;
    case 'do-what-it-says':
        getFromTxt();
        break;
    default:
        break;
}

