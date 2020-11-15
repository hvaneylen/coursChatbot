# import du framework permettant de créer un serveur web
from flask import Flask, request
# les échanges se font en json
import json

# intialisation de l'application
app = Flask(__name__)

# définition de la fonction de réponse sur l'URl <site>/webhook
@app.route('/webhook', methods=['POST'])
def webhook():
    if not request.json:
        print("requete sans json - erreur")
    req = request.get_json(force=True)
    # récupération du nom de l'action
    action = req.get('queryResult').get('action')
    print('action ' + action)
    intention=req.get('queryResult').get('intent').get('displayName')
    # reponse par défaut si l'intention n'est pas reconnue
    reponse = {
        "fulfillmentText": u"Désolé, mais je ne sais pas encore répondre à l'intention: " + intention
    }
    if action == "testWebhook":
        # construction de la réponse
        reponse={
            "fulfillmentText": u"Le webhook est opérationnel"
        }
    return json.dumps(reponse)

# run the app
if __name__ == '__main__':
   print("Webhook démarré")
   app.run()