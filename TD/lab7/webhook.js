// webhook lab 7

// Librairie Dependences 
const express = require('express');
const bodyparser = require('body-parser');
const request = require('request');

// Configuration du serveur 
const webhook = express();
webhook.use(bodyparser.json());
webhook.set('port',9900)

// token openweathermap
const owmToken = '7ee6bfdfa6178b4ee99ad48ff12d0b61';


// démarrage du serveur REST
webhook.listen(webhook.get('port'), function() {
	console.log('webhook lab7 démarré en ', webhook.get('port'));
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
				if (json.cod != 200) {
					res.json(construireWebhookReponse("Je n'ai pas la ville " + ville +  " dans mes bases de données. Désolé"))
				} else {
					desc = json.weather[0].description;
					var temp_min = json.main.temp_min - 273.15;
					var temp_max = json.main.temp_max - 273.15;
					var weatherId = json.weather[0].id
					// rechercher si le prenom existe
					var memoire = chercherContexte( req.body.queryResult.outputContexts, "memoire")
					var prenom = "";
					if ((memoire != undefined) && memoire.parameters['prenom'] != undefined)
						prenom = memoire.parameters['prenom']
					res.json(construireSlackWebhookReponse(ville,desc, temp_max.toPrecision(3), temp_min.toPrecision(3), determineSmiley(weatherId), prenom))
				}
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

function construireSlackWebhookReponse(ville, desc, max, min, smiley, prenom){
	speech = prenom + " aujourd'hui à, *"+ville+"* le temps est de type :" + desc 
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


function chercherContexte(contexts, nom){
	if (contexts === undefined) return undefined
	for (var i = 0; i < contexts.length; i++){
    console.log(contexts[i])
    if (contexts[i].name.includes(nom))
      return contexts[i]
   }
   return undefined;

}