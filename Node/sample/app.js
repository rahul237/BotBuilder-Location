require('dotenv-extended').load();

var builder = require('botbuilder');
var restify = require('restify');
var locationDialog = require('botbuilder-location');
var where = require('node-where');



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
            reverseGeocode: true,
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
            fAddress=getFormattedAddressFromPlace(place, ", ");
			var formattedAddress = 
            
            console.log(fAddress);
                            where.is(fAddress, function(err, result) {
                  if (result) {

                    session.send("Thanks, I will ship to " + 'Lat: ' + result.get('lat')+'Lng: ' + result.get('lng'));
                    /*console.log('Address: ' + result.get('address'));
                    console.log('Street Number: ' + result.get('streetNumber'));
                    console.log('Street: ' + result.get('street'));
                    console.log('Full Street: ' + result.get('streetAddress'));
                    console.log('City: ' + result.get('city'));
                    console.log('State / Region: ' + result.get('region'));
                    console.log('State / Region Code: ' + result.get('regionCode'));
                    console.log('Zip: ' + result.get('postalCode'));
                    console.log('Country: ' + result.get('country'));
                    console.log('Country Code: ' + result.get('countryCode'));
                    console.log('Lat: ' + result.get('lat'));
                    console.log('Lng: ' + result.get('lng'));*/
                  }
            });


        }
    }
]);

function getFormattedAddressFromPlace(place, separator) {
    var addressParts = [place.streetAddress, place.locality, place.region, place.postalCode, place.country];
    return addressParts.filter(i => i).join(separator);
}