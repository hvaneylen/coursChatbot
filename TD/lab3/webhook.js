// webhook lab 3

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
	console.log('webhook lab1 démarré en ', webhook.get('port'));
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
			speech = "Aujourd'hui, à " + ville + " le temps est de type :" + desc;
			res.json(construireWebhookReponse(speech));
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
