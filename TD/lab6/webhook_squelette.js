// webhook lab 6

// Librairie Dependences 
const express = require('express');
const bodyparser = require('body-parser');
const request = require('request');

// Configuration du serveur 
const webhook = express();
webhook.use(bodyparser.json());
webhook.set('port',9900)

// token openweathermap
const owmToken = 'YOUR TOKEN';


// démarrage du serveur REST
webhook.listen(webhook.get('port'), function() {
	console.log('webhook lab6 démarré en ', webhook.get('port'));
});


// Webhook route
webhook.post('/webhook', (req, res) => {
	const data = req.body;
	console.log("requete reçue :", req.body)
	action = req.body.queryResult.action
	//v= req.body.queryResult.parameters['Ville'];
	//console.log("ville : " + v)
	speech="pas d'action reconnue"
	switch(action){
		case 'testWebhook' : {
			speech = "Le webhook est opérationnel";
			res.json(construireWebhookReponse(speech));
		} break;
		case 'donnerMeteo' : {
			// récupère le nom de la ville
			var ville= req.body.queryResult.parameters['Ville'];
			// appel à OpenWeatherMap
			var stringRequest = 'http://api.openweathermap.org/data/2.5/weather/?q='+ville+'&lang=fr&APPID=' + owmToken 
			console.log("requete OWM: ", stringRequest)
			request.get(stringRequest, function(error, response,body){
				console.log(body);
				var json = JSON.parse(body);
				desc = json.weather[0].description;
				var temp_min = json.main.temp_min - 273.15;
				var temp_max = json.main.temp_max - 273.15;
				var weatherId = json.weather[0].id
				res.json(construireSlackWebhookReponse(ville,desc, temp_max.toPrecision(3), temp_min.toPrecision(3), determineSmiley(weatherId)))
				
			});
		} break;
	}
});

function construireWebhookReponse(speech){
	const reponse = {
		fulfillmentText: speech,
	}
	return reponse
}

function construireSlackWebhookReponse(ville, desc, max, min, smiley){
	speech = "Aujourd'hui à, *"+ville+"* le temps est de type :" + desc 
	const reponse = {
		fulfillmentText: speech,
		payload: {
			slack:{
				text: speech,
				username: "PolyBot",
				attachments:[
				{
					text: smiley,
					mrkdwn_in: ["text"]
				},
				{
					pretext: "Températures",
					fields: [
					{
						title: "Minimum",
						value: min,
						"short": true
					},
					{
						title: "Maximum",
						value: max,
						"short": true
					}
					]
				}
				]
			}
		}
	}
	return reponse
}

function determineSmiley(weatherId){
	if (weatherId < 600) return ":umbrella:"
	if (weatherId==803 || weatherId==804 ) return ":cloud:"
	if (weatherId==801 || weatherId==802 ) return ":partly_sunny:"
	return ":sunny:"
}
