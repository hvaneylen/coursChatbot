// webhook lab 5

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
	console.log('webhook lab5 démarré en ', webhook.get('port'));
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
			request.get('http://api.openweathermap.org/data/2.5/weather/?q='+ville+'&lang=fr&APPID=' + owmToken, function(error, response,body){
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

/*
*  construire la réponse slack
*/
function construireSlackWebhookReponse(ville, desc, max, min, smiley){
	speech = "Aujourd'hui à, *"+ville+"* le temps est de type :" + desc 
	const reponse = {
		fulfillmentText: speech,
		payload: {
			/*construire le payload slack*/
		}
	}
	return reponse
}

/*
* retourne le smiley en fonction du weatherId qui donne le type de temps
*/
function determineSmiley(weatherId){
	/*retourne ensoleillé par défaut*/
	return ":sunny:"
}
