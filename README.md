### DESCRIPTION

Ensemble de Userscripts améliorant le jeu [Blood Wars](http://www.fr.bloodwars.net) où vous incarnez un vampire dans un monde post-apocalyptique :
* [BloodWarsEnchanced](https://github.com/Ecilam/BloodWarsEnhanced) (celui-ci)
* [BloodWarsAnalyseRC](https://github.com/Ecilam/BloodWarsAnalyseRC)
* [BloodWarsSpyData](https://github.com/Ecilam/BloodWarsSpyData)
* [BloodWarsItemTest](https://github.com/Ecilam/BloodWarsItemTest)
* [BloodWarsMix](https://github.com/Ecilam/BloodWarsMix)

Ce script est compatible avec les serveurs Anglais/Français/Polonais et les navigateurs Firefox, Google Chrome, Microsoft Edge, Opera next et d'autres.

Testé principalement sur Firefox + Greasemonkey sur serveur R3FR.

Pour tout contact passer par mon [topic](http://forum.fr.bloodwars.net/index.php?page=Thread&threadID=247180) sur le forum BloodWars.


### INSTALLATION

1. Installer l'extension adaptée à votre navigateur :
  * <s>Firefox => [Greasemonkey](https://addons.mozilla.org/fr/firefox/addon/greasemonkey/)</s>.
  * Firefox, Google Chrome, Microsoft Edge, Opera next et autres => [Tampermonkey](http://tampermonkey.net/). Je ne peux garantir que mes scripts fonctionnent avec tous les navigateurs proposés par TamperMonkey. Il faudra tester de votre côté.
2. Cliquer sur ce [lien](https://raw.githubusercontent.com/Ecilam/BloodWarsEnhanced/master/BloodWarsEnhanced@bwe.user.js) pour que l'extension vous propose de l'installer.

### FONCTIONS

* Listes/Tableaux modulables et triables (Profiles, Clans, Classement, Vue sur la cité, Amis).
* **Historique des combats** aussi bien en attaque qu'en défense.
* Affichage du "Site de construction" sous forme de tableau.
* Mécanisme d'aide aux embuscades (désactivé par défaut).
* Mécanisme d'aide à la création de groupe (désactivé par défaut).
* Afficher/masquer les zones d'informations des clans en cliquant sur leur titre.
* Mémorisations de certaines données pour affichage sur d'autres pages (sexe,race...).
* Puit des âmes : affiche le total des pierres.
* Multicompte supporté (voir réglement du jeu).

Les Préférences du jeu vous proposent 2 menus supplémentaires :
* **BWE - OPTIONS :** permet de modifier le comportement des fonctions ci-dessus.
* **BWE - BASE DE DONNÉES :** permet de consulter/supprimer les données stockées. A utiliser avec précaution !!

### AIDE

* **1ère utilisation :** un message vous rappellera de consulter la Salle du Trône pour que le script puisse récupérer l'IUD du personnage afin de pouvoir fonctionner.
* **Historique des combats :**
	- affiche le temps passé depuis votre dernière attaque sur cette cible (gris= raté, vert = victoire, orange = match nul, rouge = défaite)
	- une * indique 2 attaques effectuées sur cette cible dans la même journée/ Le script prenant en compte l'heure de fin de l'embuscade, avec le temps de déplacement il est possible que l'attaque ait été lancée avant minuit.
	- au passage de la souris, affiche une info bulle avec les éléments de la rencontre (modulable via les Préférences).
* **Aide aux embuscades :**
	- fait clignoter l'icône de combat suivant les critères choisis (voir les Préférences). 
	- Ex : pour la version 1.5.6 du jeu, mettre 100 dans la partie "Classement"/"Ecart supérieur" pour obtenir les cibles rapportant 2 points d'évolution. Laisser les autres cases vides.
* **Aide à la création de Groupe :**
	- permet de constituer 2 groupes pour une confrontation à venir de type siège organisé ou autres.
	- sur le Profil, 'Groupe' est cliquable pour permettre d'afficher/masquer les listes.
	- petite astuce : le copier/coller peut être utilisé pour envoyer la liste à un autre joueur.

### INFORMATIONS

* **Données :** les données sont stockées avec LOCALSTORAGE.
* **Localisation :** n'ayant que des personnages de bas niveau sur les serveurs Anglais/Polonais, je n'ai pas la possibilité de tester certaines fonctions de ce script.
* **[FrenchUnMod](https://greasyfork.org/scripts/2158-frenchunmod)** : plusieurs incompatibilités. Voir mon [topic](http://forum.fr.bloodwars.net/index.php?page=Thread&threadID=247180).
