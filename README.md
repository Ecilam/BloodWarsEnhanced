###DESCRIPTION
Ensemble de Userscripts améliorant le jeu [Blood Wars](http://www.fr.bloodwars.net) où vous incarnez un vampire dans un monde post-apocalyptique :
* [BloodWarsEnchanced](https://github.com/Ecilam/BloodWarsEnhanced) (celui-ci)
* [BloodWarsAnalyseRC](https://github.com/Ecilam/BloodWarsAnalyseRC)
* [BloodWarsSpyData](https://github.com/Ecilam/BloodWarsSpyData)
* [BloodWarsToolBox](https://github.com/Ecilam/BloodWarsToolBox)

Ce script est compatible avec les serveurs Anglais/Français/Polonais 1.5.5 et les navigateurs Firefox, Chrome et Opera (à confirmer pour les 2 derniers).
Testé principalement avec Firefox 30.0 sur serveur R3FR.

Pour tout contact passer par mon [topic](http://forum.fr.bloodwars.net/index.php?page=Thread&threadID=204323/) sur le forum BloodWars.
Pour les bugs, GitHub propose une section [Issues](https://github.com/Ecilam/BloodWarsEnhanced/issues).

###INSTALLATION
* Firefox (tests v30.0) : installer préalablement le module [Greasemonkey](https://addons.mozilla.org/fr/firefox/addon/greasemonkey/) ou [Scriptish](https://addons.mozilla.org/en-US/firefox/addon/scriptish/).
* Google Chrome (tests v35) : installer l'extension [Tampermonkey](https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo).
* Opera (tests v22.0) : installer [Chrome extension](https://addons.opera.com/fr/extensions/details/download-chrome-extension-9/?display=en) puis [Tampermonkey](https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo).
* Ensuite afficher la version [RAW](https://raw.githubusercontent.com/Ecilam/BloodWarsEnhanced/master/BloodWarsEnhanced@bwe.user.js) du script pour que le module (ou l'extension) vous propose de l'installer.

###FONCTIONS
* Listes/Tableaux modulables et triables (Profiles, Clans, Classement, Vue sur la cité, Amis).
* **Historique des combats** aussi bien en attaque qu'en défense. Les infos sont modulables via les préférences.
* Mécanisme d'aide aux embuscades.
* Mécanisme d'aide à la création de groupe.
* Afficher/masquer les zones d'informations des clans en cliquant sur leur titre.
* Mémorisations de certaines données pour affichage sur d'autres pages (sexe,race...).
* Puit des âmes : affiche le total des pierres
* Multicompte supporté (voir réglement du jeu).

Les Préférences du jeu vous proposent 2 menus supplémentaires :
* **BWE - OPTIONS :** permet de modifier le comportement des fonctions ci-dessus.
* **BWE - BASE DE DONNÉES :** permet de consulter/supprimer les données stockées. A utiliser avec précaution !!

###AIDE
* **1ère utilisation :** un message vous rappellera de consulter la Salle du Trône pour que le script puisse récupérer l'IUD du personnage afin de pouvoir fonctionner.
* **Historique des combats :**
	- affiche le temps passé depuis votre dernière attaque sur cette cible (gris= raté, vert = victoire, orange = match nul, rouge = défaite)
	- une * indique 2 attaques effectuées sur cette cible dans la même journée/ Le script prenant en compte l'heure de fin de l'embuscade, avec le temps de déplacement il est possible que l'attaque ait été lancée avant minuit.
	- au passage de la souris, affiche une info bulle avec les éléments de la rencontre (voir les Préférences).
* **Aide aux embuscades :**
	- fait clignoter l'icône de combat suivant les critères choisis (voir les Préférences). 
	- Ex : pour la version 1.5.5 du jeu, mettre 100 dans la partie "Classement"/"Ecart supérieur" pour obtenir les cibles rapportant 2 points d'évolution. Laisser les autres cases vides.
* **Aide à la création de Groupe :**
	- permet de constituer 2 groupes pour une confrontation à venir de type siège organisé ou autres.
	- sur le Profil, 'Groupe' est cliquable pour permettre d'afficher/masquer les listes.
	- petite astuce : le copier/coller peut être utilisé pour envoyer la liste à un autre joueur.

###INFORMATIONS
* **Données :** les données sont stockées avec LOCALSTORAGE.
* **Localisation :** n'ayant que des personnages de bas niveau sur les serveurs Anglais/Polonais, je n'ai pas la possibilité de tester certaines fonctions de ce script.
