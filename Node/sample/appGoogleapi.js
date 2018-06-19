// This loads the environment variables from the .env file
require('dotenv-extended').load();

var publicConfig = {
  key: 'AIzaSyDyfo8AcLlsScphAz8kC4MnPFllER4yqSI',
  stagger_time:       1000, // for elevationPath
  encode_polylines:   false,
  secure:             true, // use https
  proxy:              'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
};

var GoogleMapsAPI=require('googlemaps');
var gmAPI = new GoogleMapsAPI(publicConfig);
var builder = require('botbuilder');
var restify = require('restify');
var locationDialog = require('botbuilder-location');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

bot.library(locationDialog.createLibrary('AutTPlW-pi_as77ubk2ALtrtJuqY30qq8yYIRR2Zn9R8yImy11dReIwWC-_4zYK1'));

bot.dialog("/", [
    function (session) {
        var options = {
            prompt: "Where should I ship your order?",
            useNativeControl: true,
            reverseGeocode: false,
			skipFavorites: false,
			skipConfirmationAsk: true,
            requiredFields:
                locationDialog.LocationRequiredFields.streetAddress |
                locationDialog.LocationRequiredFields.locality |
                locationDialog.LocationRequiredFields.region |
                locationDialog.LocationRequiredFields.postalCode |
                locationDialog.LocationRequiredFields.country
        };

        locationDialog.getLocation(session, options);
    },
    function (session, results) {
        if (results.response) {


            var place = results.response;

            var geocodeParams = {
  "address":    getFormattedAddressFromPlace(place, ", "),
  "components": "components=country:GB",
  "bounds":     "55,-1|54,1",
  "language":   "en",
  "region":     "uk"
};
 
gmAPI.geocode(geocodeParams, function(err, result){
  console.log(result);
});
			var formattedAddress = 
            session.send("Thanks, I will ship to " + getFormattedAddressFromPlace(place, ", "));
        }
    }
]);

function getFormattedAddressFromPlace(place, separator) {
    var addressParts = [place.streetAddress, place.locality, place.region, place.postalCode, place.country];
    return addressParts.filter(i => i).join(separator);
}