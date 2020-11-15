// webhook lab 3

// Librairie Dependences 
const express = require('express');
const bodyparser = require('body-parser');


// Configuration du serveur 
const webhook = express();
webhook.use(bodyparser.json());
webhook.set('port',9900)

// token openweathermap
const owmToken = <Votre token>;


// démarrage du serveur REST
webhook.listen(webhook.get('port'), function() {
	console.log('webhook lab3 démarré en ', webhook.get('port'));
});


// Webhook route
webhook.post('/webhook', (req, res) => {
	const data = req.body;
	console.log("requete reçue :", req.body)
	action = req.body.queryResult.action
	speech="pas d'action reconnue"
	switch(action){
		case 'testWebhook' : {
			speech = "Le webhook est opérationnel";
			res.json(construireWebhookReponse(speech));
		} break;
	}
});

function construireWebhookReponse(speech){
	const reponse = {
		fulfillmentText: speech,
	}
	return reponse
}
