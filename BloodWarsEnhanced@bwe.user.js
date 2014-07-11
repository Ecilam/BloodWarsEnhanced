(function(){
// coding: utf-8
// ==UserScript==
// @author		Ecilam
// @name		Blood Wars Enhanced
// @version		2014.07.11
// @namespace	BWE
// @description	Ce script ajoute des fonctionnalités supplémentaires à Blood Wars.
// @copyright   2011-2014, Ecilam
// @license     GPL version 3 ou suivantes; http://www.gnu.org/copyleft/gpl.html
// @homepageURL https://github.com/Ecilam/BloodWarsEnhanced
// @supportURL  https://github.com/Ecilam/BloodWarsEnhanced/issues
// @include     /^http:\/\/r[0-9]*\.fr\.bloodwars\.net\/.*$/
// @include     /^http:\/\/r[0-9]*\.bloodwars\.net\/.*$/
// @include     /^http:\/\/r[0-9]*\.bloodwars\.interia\.pl\/.*$/
// @include     /^http:\/\/beta[0-9]*\.bloodwars\.net\/.*$/
// @grant       none
// ==/UserScript==
"use strict";

function _Type(value){
	var type = Object.prototype.toString.call(value);
	return type.slice(8,type.length-1);
	}

function _Exist(value){
	return _Type(value)!='Undefined';
	}

// passe l'objet par valeur et non par référence
function clone(objet){
	if(typeof objet!='object'||objet==null) return objet;
	var newObjet = objet.constructor();
	for(var i in objet)	newObjet[i] = clone(objet[i]);
	return newObjet;
	}

/******************************************************
* OBJET JSONS - JSON
* - stringification des données
******************************************************/
var JSONS = (function(){
	function reviver(key,value){
		if (_Type(value)=='String'){
			var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
			if (a!=null) return new Date(Date.UTC(+a[1],+a[2]-1,+a[3],+a[4],+a[5],+a[6]));
			}
		return value;
		}
	return {
		_Decode: function(value){
			var result = null;
			try	{
				result = JSON.parse(value,reviver);
				}
			catch(e){
				console.error('JSONS_Decode error :',value,e);
				}
			return result;
			},
		_Encode: function(value){
			return JSON.stringify(value);
			}
		};
	})();

/******************************************************
* OBJET LS - Datas Storage
* - basé sur localStorage
* Note : localStorage est lié au domaine
******************************************************/
var LS = (function(){
	var LS = window.localStorage;
	return {
		_GetVar: function(key,defaut){
			var value = LS.getItem(key); // if key does not exist return null 
			return ((value!=null)?JSONS._Decode(value):defaut);
			},
		_SetVar: function(key,value){
			LS.setItem(key,JSONS._Encode(value));
			return value;
			},
		_Delete: function(key){
			LS.removeItem(key);
			return key;
			},
		_Length: function(){
			return LS.length;
			},
		_Key: function(index){
			return LS.key(index);
			},
		};
	})();

/******************************************************
* OBJET DOM - Fonctions DOM & QueryString
* -  DOM : fonctions d'accès aux noeuds du document
* - _QueryString : accès aux arguments de l'URL
******************************************************/
var DOM = (function(){
	return {
		_GetNodes: function(path,root){
			var contextNode=(_Exist(root)&&root!=null)?root:document;
			var result=document.evaluate(path, contextNode, null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			return result;
			},
		_GetFirstNode: function(path,root){
			var result = this._GetNodes(path,root);
			return ((result.snapshotLength >= 1)?result.snapshotItem(0):null);
			},
		_GetLastNode: function(path, root){
			var result = this._GetNodes(path,root);
			return ((result.snapshotLength >= 1)?result.snapshotItem(result.snapshotLength-1):null);
			},
		_GetFirstNodeTextContent: function(path,defaultValue,root){
			var result = this._GetFirstNode(path,root);
			return (((result!=null)&&(result.textContent!=null))?result.textContent:defaultValue);
			},
		_GetFirstNodeInnerHTML: function(path,defaultValue,root){
			var result = this._GetFirstNode(path,root);
			return (((result!=null)&&(result.innerHTML!=null))?result.innerHTML:defaultValue);
			},
		_GetLastNodeInnerHTML: function(path,defaultValue,root){
			var result = this._GetLastNode(path,root);
			return (((result!=null)&&(result.innerHTML!=null))?result.innerHTML:defaultValue);
			},
		// retourne la valeur de la clé "key" trouvé dans l'url
		// null: n'existe pas, true: clé existe mais sans valeur, autres: valeur
		_QueryString: function(key){
			var url = window.location.search,
				reg = new RegExp("[\?&]"+key+"(=([^&$]+)|)(&|$)","i"),
				offset = reg.exec(url);
			if (offset!=null){
				offset = _Exist(offset[2])?offset[2]:true;
				}
			return offset;
			}
		};
	})();

/******************************************************
* OBJET IU - Interface Utilsateur
******************************************************/
var IU = (function(){
	return {
		// reçoit une liste d'éléments pour créér l'interface
		// ex: {'name':['input',{'type':'checkbox','checked':true},['coucou'],{'click':[funcname,5]},body]
		_CreateElements: function(list){
			var result = {};
			for (var key in list){
				var type = _Exist(list[key][0])?list[key][0]:null,
					attributes = _Exist(list[key][1])?list[key][1]:{},
					content = _Exist(list[key][2])?list[key][2]:[],
					events = _Exist(list[key][3])?list[key][3]:{},
					node = _Exist(result[list[key][4]])?result[list[key][4]]:(_Exist(list[key][4])?list[key][4]:null);
				if (type!=null) result[key] = this._CreateElement(type,attributes,content,events,node);
				}
			return result;
			},
		_CreateElement: function(type,attributes,content,events,node){
			if (_Exist(type)&&type!=null){
				attributes = _Exist(attributes)?attributes:{};
				content = _Exist(content)?content:[];
				events = _Exist(events)?events:{};
				node = _Exist(node)?node:null;
				var result = document.createElement(type);
				for (var key in attributes){
					if (_Type(attributes[key])!='Boolean') result.setAttribute(key,attributes[key]);
					else if (attributes[key]==true) result.setAttribute(key,key.toString());
					}
				for (var key in events){
					this._addEvent(result,key,events[key][0],events[key][1]);
					}
				for (var i=0; i<content.length; i++){
					if (_Type(content[i])==='Object') result.appendChild(content[i]);
					else result.textContent+= content[i];
					}
				if (node!=null) node.appendChild(result);
				return result;
				}
			else return null;
			},
		// IU._addEvent(obj: objet,type: eventype,fn: function,par: parameter);
		// function fn(e,par) {alert('result : ' + this.value+e.type+par);}
		// this = obj, e = event
		// ex : IU._addEvent(result,'click',test,"2");
		_addEvent: function(obj,type,fn,par){
			var funcName = function(event){return fn.call(obj,event,par);};
			obj.addEventListener(type,funcName,false);
			if (!obj.BWEListeners) {obj.BWEListeners = {};}
			if (!obj.BWEListeners[type]) obj.BWEListeners[type]={};
			obj.BWEListeners[type][fn.name]=funcName;
			},
		// voir _addEvent pour les paramètres
		_removeEvent: function(obj,type,fn){
			if (obj.BWEListeners[type]&&obj.BWEListeners[type][fn.name]){
				obj.removeEventListener(type,obj.BWEListeners[type][fn.name],false);
				delete obj.BWEListeners[type][fn.name];
				}
			},
		// voir _addEvent pour les paramètres
		_removeEvents: function(obj){
			if (obj.BWEListeners){
				for (var key in obj.BWEListeners){
					for (var key2 in obj.BWEListeners[key]){
						obj.removeEventListener(key,obj.BWEListeners[key][key2],false);
						}
					}
				delete obj.BWEListeners;
				}
			}
		};
	})();

/******************************************************
* OBJET L - localisation des chaînes de caractères (STRING) et expressions régulières (RegExp)
******************************************************/
var L = (function(){
	var locStr = {// key:[français,anglais,polonais]
		//DATAS
		"sNiveau":["NIVEAU ([0-9]+)","LEVEL ([0-9]+)","POZIOM ([0-9]+)"],
		"sXP":
			["EXPÉRIENCE: <strong>([0-9 ]+)<\\/strong> \\/ ([0-9 ]+)",
			"EXPERIENCE: <strong>([0-9 ]+)<\\/strong> \\/ ([0-9 ]+)",
			"DOŚWIADCZENIE: <strong>([0-9 ]+)<\\/strong> \\/ ([0-9 ]+)"],
		"sPdP":
			["PTS DE PROGRÈS: <strong>([0-9 ]+)<\\/strong>",
			"PTS OF PROGRESS: <strong>([0-9 ]+)<\\/strong>",
			"PKT ROZWOJU: <strong>([0-9 ]+)<\\/strong>"],
		"sLOL":["([0-9 ]+) LOL","([0-9 ]+) Lgo","([0-9 ]+) PLN"],
		"sPopulation":["([0-9 ]+) "],
		"sDeconnecte":
			["Vous avez été déconnecté en raison d`une longue inactivité.",
			"You have been logged out because of inactivity.",
			"Nastąpiło wylogowanie z powodu zbyt długiej bezczynności."],
		"sCourtePause":
			["Une courte pause est en court en raison de l`actualisation du classement général",
			"Please wait a moment while the rankings are being updated.",
			"Trwa przerwa związana z aktualizacją rankingu gry."],
		//<td><strong><u>Une pause en raison de conservation est en court.</u><br /><br />Vous êtes prié(e) de ressayer dans quelques minutes.</strong></td>
		//<td><strong><u>Une pause est en court en raison du proces de sauvegarde de la base de données.</u> <br />
		//INIT
		"sUnknowID":
			["BloorWarsEnhanced - Erreur :\n\nLe nom de ce vampire doit être lié à son ID. Merci de consulter la Salle du Trône pour rendre le script opérationnel.\nCe message est normal si vous utilisez ce script pour la première fois ou si vous avez changé le nom du vampire.",
			"BloorWarsEnhanced - Error :\n\nThe name of this vampire must be linked to her ID. Please consult the Throne Room to make the script running.\nThis message is normal if you use this script for the first time or if you changed the name of the vampire.",
			"BloorWarsEnhanced - Błąd :\n\nNazwa tego wampira musi być związana z jej ID. Proszę zapoznać się z sali tronowej, aby skrypt uruchomiony.\nTo wiadomość jest normalne, jeśli użyć tego skryptu po raz pierwszy lub jeśli zmienił nazwę wampira."],
		// pOProfile/pProfile
		"sNameTest":["Profil du vampire (.+) ","Vampire profile (.+) ","Profil wampira (.+) "],
		"sSexeHomme":["Homme","Male","Mężczyzna"],
		"sSexeH":["H","M","M"],
		"sSexeF":["F","F","K"],
		"sProfAtt":["ATT:","ATT:","ATA:"],
		"sProfDef":["DEF:","DEF:","OBR:"],
		// Titres des Groupes
		"BWEgrpA":["GROUPE A","GROUP A","GRUPA A"],
		"BWEgrpB":["GROUPE B","GROUP B","GRUPA B"],
		"BWEgrpAct":["ACTIONS","ACTIONS","AKCJA"],
		"BWEgrpPl":["$1 joueur","$1 player","$1 gracz"],
		"BWEgrpPls":["$1 joueurs","$1 players","$1 gracze"],
		"BWEgrpTt":["Somme:","Sum:","Suma:"],
		"BWEgrpMoy":["Moyenne:","Average:","Średnia:"],
		// Divers
		"sNivFormat":["$1 ($2)"],
		// Race
		"sRaces":[["ABSORBEUR","CAPTEUR D`ESPRIT","CULTISTE","DAMNÉ","SEIGNEUR DES BÊTES"],
			["ABSORBER","THOUGHTCATCHER","CULTIST","CURSED ONE","BEASTMASTER"],
			["SSAK","ŁAPACZ MYŚLI","KULTYSTA","POTĘPIONY","WŁADCA ZWIERZĄT"]],
		// tri
		"sTriUp":["▲"],
		"sTriDown":["▼"],
		"sTriOLTest":
			["^(([0-9]+) j\\. |)(([0-9]+) h |)(([0-9]+) min |)(([0-9]+) sec\\.|)\\s?$",
			"^(([0-9]+) day\\(s\\) |)(([0-9]+) hour\\(s\\) |)(([0-9]+) min\\. |)(([0-9]+) sec\\.|)\\s?$",
			"^(([0-9]+) d\\. |)(([0-9]+) godz\\. |)(([0-9]+) min\\. |)(([0-9]+) sek\\.|)\\s?$"],
		"sTriImgTest":[".*/._(ok|not)\\.gif"],
		"sTriAdrTest":["([0-9]+)\\/([0-9]+)\\/([0-9]+)"],
		"sTriNbTest":["^([0-9]+(?:\\.[0-9]*)?)$"],
		"sTriPtsTest":["^([0-9]+)(?:\\-[0-9]+)? \\(([0-9 ]+)\\)$"],
		"sTriPrcTest":["^([0-9]+)\\([0-9 ]+\\%\\)$"],
		// pMsgList/pMsgSaveList
		"sTitleIndex":["Titre du message","Message title","Tytuł wiadomości"],
		"sDateIndex":["Date d`envoi","Send date","Data wysłania"],
		"sAmbushMsg1":
			[".(.+) a préparé une embuscade contre toi!",
			".(.+) ambushed you!",
			".(.+) urządził[a]? na Ciebie zasadzkę!"],
		"sAmbushMsg2":
			["Tu as préparé une embuscade contre (.+)\\.",
			"You ambushed (.+)\\.",
			"Urządził[ae]ś zasadzkę na (.+)\\."],
		// pMsg/pMsgSave
		"sAmbushTest1":
			["<a[^<>]+>([^<>]+)<\\/a> a organisé une embuscade contre <a[^<>]+>([^<>]+)<\\/a> !",
			"<a[^<>]+>([^<>]+)<\\/a> ambushed <a[^<>]+>([^<>]+)<\\/a> !",
			"<a[^<>]+>([^<>]+)<\\/a> urządził[a]? zasadzkę na <a[^<>]+>([^<>]+)<\\/a> !"],
		"sAmbushTest2":
			["Chance de réussite de l`embuscade: ([0-9]+,[0-9]+) %",
			"Chance of successful ambush ([0-9]+,[0-9]+) %",
			"Szansa na udaną zasadzkę: ([0-9]+,[0-9]+) %"],
		"sAmbushTest3":
			["$1 a préparé un plan minutieux",
			"$1 prepared an elaborate plan",
			"$1 przygotował[a]? misterny plan"],
		"sAmbushTest4":
			["Grâce à une action habilement menée, ",
			"Thanks to the perfectly prepared ambush ",
			"Dzięki świetnie przeprowadzonej zasadzce "],
		"sAmbushTest5":
			["L`attaque sur <b>$1<\\/b> n`était pas une très bonne idée",
			"The attack on <b>$1<\\/b> was not a good idea",
			"Atak na <b>$1<\\/b> nie był najlepszym pomysłem"],
		"sAmbushTest6":
			["Les deux adversaires étaient très bien préparés au combat",
			  "Both sides were well prepared",
			 "Obie strony były świetnie przygotowane"],
		"sAmbushTest7":["([0-9]+) \\/ ([0-9]+)<br>([0-9]+) \\/ ([0-9]+)"],
		"sAmbushTest8":
			["(<b>([^<>]+)<\\/b> utilise l`arcane <span.+>([^<>]+)<\\/span> niveau <b>([0-9]+)<\\/b>\\.)+",
			"(<b>([^<>]+)<\\/b> uses arcana <span.+>([^<>]+)<\\/span> level <b>([0-9]+)<\\/b>\\.)+",
			"(<b>([^<>]+)<\\/b> używa arkana <span.+>([^<>]+)<\\/span> poziom <b>([0-9]+)<\\/b>\\.)+"],
		"sAmbushTest9":
			["(<b>([^<>]+)<\\/b> utilise l`évolution: (<span[^>]+>[^<>]+<\\/span>[., ]+)+)+",
			"(<b>([^<>]+)<\\/b> uses evolution: (<span[^>]+>[^<>]+<\\/span>[., ]+)+)+",
			"(<b>([^<>]+)<\\/b> korzysta z ewolucji: (<span[^>]+>[^<>]+<\\/span>[., ]+)+)+"],
		"sAmbushTest10":
			["(<span[^>]+>([^<>]+) niv. ([0-9]+)<\\/span>)+",
			 "(<span[^>]+>([^<>]+) lvl ([0-9]+)<\\/span>)+",
			 "(<span[^>]+>([^<>]+) poz. ([0-9]+)<\\/span>)+"],
		"sAmbushTest11":["<td[^<>]+><b>([^<>]+)<\\/b><\\/td><td[^<>]+>$1<\\/td><td[^<>]+><b>([^<>]+)<\\/b>"],
		"sAmbushTest12":
			["(<b>([^<>]+)<\\/b> utilise l`objet[^<>]+<span.+>([^<>]+)<\\/span>\\.)+",
			"(<b>([^<>]+)<\\/b> uses item[^<>]+<span.+>([^<>]+)<\\/span>\\.)+",
			"(<b>([^<>]+)<\\/b> używa przedmiotu[^<>]+<span.+>([^<>]+)<\\/span>\\.)+"],
		"sAEFormat":["$1 x$2"],
		"sPVFormat":["$1/$2"],
		"sAmbushTest13":
			["<b>$1<\\/b> mord le vampire vaincu dans la nuque et lui suce <b>([0-9]+)<\\/b> pts de progrès\\.",
			"<b>$1<\\/b> bit into the enemy`s neck and sucked out <b>([0-9]+)<\\/b> experience pts\\.",
			"<b>$1<\\/b> wgryza się w szyję pokonanego wroga i wysysa <b>([0-9]+)<\\/b> pkt doświadczenia\\."],
		"sAmbushTest14":
			["(?:<b>|)$1(?:<\\/b>|) mord le vampire vaincu dans la nuque, lui suce (?:<b>|)([0-9]+)(?:<\\/b>|) pts de progrès et obtient (?:<b>|)([0-9]+)(?:<\\/b>|) pts d`honneur\\.",
			"<b>$1<\\/b> bit into the enemy`s neck and sucked out <b>([0-9]+)<\\/b> experience pts and gained <b>([0-9]+)<\\/b> honour pts\\.",
			"<b>$1</b> wgryza się w szyję pokonanego wroga i wysysa <b>([0-9]+)<\\/b> pkt doświadczenia oraz otrzymuje <b>([0-9]+)<\\/b> pkt reputacji\\."],
		"sAmbushTest15":
			["(?:<b>|)$1(?:<\\/b>|) paie une rançon d`un montant de (?:<b>|)([0-9]+) LOL(?:<\\/b>|), (?:<b>|)([0-9]+)(?:<\\/b>|) litre\\(s\\) de sang et.+lui livre (?:<b>|)([0-9]+)(?:<\\/b>|) hommes comme esclaves\\.",
			"<b>$1<\\/b> paid ransom of <b>([0-9]+) Lgo<\\/b>, <b>([0-9]+)<\\/b> litres of blood and gave <b>([0-9]+)<\\/b> prisoners\\.",
			"<b>$1<\\/b> płaci okup w wysokości <b>([0-9]+) PLN<\\/b>, <b>([0-9]+)<\\/b> litrów krwi oraz oddaje <b>([0-9]+)<\\/b> ludzi w niewolę\\."],
		"sAmbushTest16":
			["<b>$1<\\/b> reçoit <b>([0-9]+)<\\/b> pts d`évolution\\!",
			"<b>$1<\\/b> gains <b>([0-9]+)<\\/b> evolution pts\\!",
			"<b>$1<\\/b> zdobywa <b>([0-9]+)<\\/b> pkt ewolucji\\!"],
		// pMkstone et autres
		"sTotal":["Total: ","Total: ","łączny: "],
		// pAmbushRoot
		"sMidMsg":["a=msg&do=view&mid=([0-9]+)"],
		"sAtkTime":["timeFields\\.atkTime = ([0-9]+)"],
		// historique
		"sLogVS":["$1 VS $2"],
		"sLogTime1":["$1s"],
		"sLogTime2":["$1m"],
		"sLogTime3":["$1h","$1h","$1g"],
		"sLogTime4":["$1j","$1d","$1d"],
		"sLogTime5":["+1an","+1y","+1rok"],
		"sLogNC":["Analyse nécessaire","Analysis required","Analiza wymagane"],
		"sNC":["INCONNUE","UNKNOW","NIEZNANY"],
		"sArc":[["Silence du Sang","Absorption de la Force","Le pouvoir du Sang","Masque d`Adonis","Masque de Caligula","La Majesté","Sang de la Vie","Voies Félines","L`Ardeur du Sang","Le Chasseur de la Nuit","Le Souffle Mortel","L`Horreur","Frénésie Sauvage","Peau de Bête","L`Ombre de la Bête"],
			["Silence of Blood","Power absorption","Power of Blood","Mask of Adonis","Mask of Caligula","Majesty","Blood of Life","Cat`s Paths","Searing Blood","Night Hunter","Breath of Death","Horror","Bloodfrenzy","Beast`s Hide","Shadow of the Beast"],
			["Cisza Krwi","Wyssanie mocy","Moc Krwi","Maska Adonisa","Maska Kaliguli","Majestat","Krew Życia","Kocie Ścieżki","Żar Krwi","Nocny Łowca","Tchnienie Śmierci","Groza","Dziki Szał","Skóra Bestii","Cień Bestii"]],
		"sEvo":[["Les Ailes","Carapace","Canines/Griffes/Pointes","Glandes à venin","Tendons renforcés","Chambre supplémentaire","Le sang du démon","Mutation ADN","Eclairé","Sixième sens","Absorption","Développement Harmonieux","Mana Purifiée","Mémoire Ancestrale","Puissance"],
			["Wings","Carapace","Claws/Fangs/Quills","Venom glands","Hardened tendons","Additional cavity","Daemon blood","Mutated DNA","Enlightened","Sixth sense","Absorption","Harmonious development","Mana contamination","Memory of the ancestors","Might"],
			["Skrzydla","Pancerz","Kly/Pazury/Kolce","Gruczoly jadowe","Wzmocnione sciegna","Dodatkowa komora","Krew demona","Mutacja DNA","Oswiecony","Szósty zmysl","Absorpcja","Harmonijny rozwój","Skażenie Maną","Pamięć przodków","Potęga"]],
		"sObjet":[["Sang de loup","Pomme de l`Arbre Ferreux","Nageoire de requin","Élixir des sens","Eau bénite","Larme de phénix","Cachet magique","Coeur de chauve-souris","Fleur de lotus","Venin de puce géante","Sérum d`illumination","Bouillon de chat noir","Charbon","Fourrure de taupe","Salpêtre",
			"Essence de jouvence","Ongle de troll","Belladones","Oeil de chat","Absinthe","Écaille de salamandre","Eau de source","Os de martyre","Élixir d`amour","Venin de scorpion","Racine de mandragore","Poussière d`étoile","Fiole d`acide","Soufre","Diamant noir",
			"Larme divine","Dent de ghoule","Bouillon de corail","Coeur de prophète","Griffe du basilic","Ecailles de démon","Ailes du scarabée","Masque de gargouille","Jus de mante religieuse","Souffle du dragon","Dent de sorcière","Grimoire","Appendice noire","Doigt de forgeron","Fleur de lila"],
			["Wolf Blood","Iron Tree Apple","Shark Fin","Elixir of Senses","Blessed Water","Phoenix Tear","Magic Seal","Bat Heart","Black Lotus","Gigaflea Venom","Serum of Enlightenment","Brew of the Black Cat","Coal","Mole Fur","Saltpetre",
			"Essence of Youth","Troll Nail","Deadly Nightshade","Eye of the Cat","Absinthe","Salamander Scales","Spring Water","Bone of the Martyr","Love Beverage","Scorpid Venom","Mandrake Root","Star Dust","Vial of Acid","Sulphur","Black Diamond",
			"Divine Tear","Ghoul`s Tooth","Coral Concoction","Heart of a Prophet","Basilisk`s Claw","Demon`s Scales","Beetle Wings","Gargoyle`s Mask","Mantis Juice","Dragon`s Breath","Tooth of a Witch","Grimoire","Black Bile","Blacksmith`s Finger","Elderberry Flower"],
			["Krew wilka","Jablko Zelaznego drzewa","Pletwa rekina","Eliksir zmyslów","Swiecona woda","Lza feniksa","Magiczna pieczec","Serce nietoperza","Kwiat lotosu","Jad Wielkopchly","Serum oswiecenia","Wywar z czarnego kota","Wegiel","Siersc kreta","Saletra",
			"Esencja mlodosci","Paznokiec trolla","Wilcza jagoda","Oko kota","Absynt","Luski salamandry","Woda zródlana","Kosc meczennika","Napój milosny","Jad Skorpiona","Korzen Mandragory","Gwiezdny pyl","Fiolka kwasu","Siarka","Czarny diament",
			"Boska łza","Ząb ghula","Wywar z koralowca","Serce proroka","Pazur bazyliszka","Łuski demona","Skrzydła chrząszcza","Maska gargulca","Sok z modliszki","Oddech smoka","Ząb wiedźmy","Grimoire","Czarna żółć","Palec kowala","Kwiat bzu"]],
		// Titres des colonnes
		"sColTitle": //
			[["RACE","SEXE","ADRESSE","CLAN","<vide>","NIVEAU","POINTS","NIV (PTS)","GROUPE","STATUT","Place au classement","Date d`inscription","Dernière connexion","Provenance","HISTORIQUE", // 0-14
			"Nom","En ligne","<En ligne>","<Expéditions>","<Roi de la Colline>","Grade","A-B","<SEXE - icône>","ATT","<ATTAQUER>","DEF", // 15-25
			"PLACE","NOM","<N° du quartier>","MAÎTRE DU QUARTIER","ACTIONS", // 26-30
			"N°","Divers","Arcanes","Evolutions","Caractéristiques","Ressources", // 31-36
			"Date","Emb.","PV Att","PV Déf","Objet Att","Objet Def", // 37-42
			"NIVEAU","Pts DE VIE","Défense","FORCE","AGILITÉ","RÉSISTANCE","APPARENCE","CHARISME","RÉPUTATION","PERCEPTION","INTELLIGENCE","SAVOIR","AGI+PER", // 43-55
			"PdP","PdH","Pts évo","LOL","Sang","Pop", // 56-61
			"<Checkbox>","Titre du message","Expéditeur","Date d`envoi", // 62-65
			"<Place au classement>","Nom du clan","Tag du clan","Chef","Date de la fondation","Membres"], // 66-71
			["RACE","SEX","ADDRESS","CLAN","<empty>","LEVEL","POINTS","LVL (PTS)","GROUP","STATUS","Standing","Date of entry","Last logged","Provenance","HISTORY",
			"Name","On-line","<On-line>","<Expedition>","King Of the hill","Rank","A-B","SEX - icon","ATT","<ATTACK>","DEF",
			"STANDING","NAME","<N° of square>","SQUARE OWNER","ACTIONS",
			"N°","Misc.","Arcana","Evolution","Characteristic","Resources",
			"Date","Emb.(%)","HP Att","HP Def","Obj.Att","Obj.Def",
			"LEVEL","HIT POINTS","Defence","STRENGTH","AGILITY","TOUGHNESS","APPEARANCE","CHARISMA","REPUTATION","PERCEPTION","INTELLIGENCE","KNOWLEDGE","AGI+PER",
			"PoP","PoH","Evo pts","Lgo","blood","People",
			"<Checkbox>","Message title","Sender","Send date",
			"<Place ranking>","Clan name","Clan tag","Leader","Creation date","Members"],
			["RASA","PŁEĆ","ADRES","KLAN","<pusty>","POZIOM","PUNKTY","POZ (PKT)","GRUPA","STATUS","Miejsce w rankingu","Data dołączenia","Ostatnie logowanie","Pochodzenie","HISTORY",
			"Imię","On-line","<On-line>","<Ekspedycja>","Król Wzgórza","Ranga","A-B","PŁEĆ - ikona","ATA","<NAPADNIJ>","OBR",
			"MIEJSCE","IMIĘ","<N° kwadratu>","WŁADCA KWADRATU","DZIAŁANIA",
			"N°","Różny","Arkana","Ewolucja","Charakterystyka","Zasoby",
			"Data","Zas.(%)","PŻ Nap","PŻ Obr","Obi.Ata","Obi.Obr",
			"POZIOM","PKT. ŻYCIA","Obrona","SIŁA","ZWINNOŚĆ","ODPORNOŚĆ","WYGLĄD","CHARYZMA","WPŁYWY","SPOSTRZEGAWCZOŚĆ","INTELIGENCJA","WIEDZA","ZWI+SPO",
			"Pkt roz","Pkt rep","Pkt ewo","PLN","Krew","Ludzie",
			"<Checkbox>","Tytuł wiadomości","Nadawca","Data wysłania",
			"<Ranking umieszczać>","Nazwa klanu","Tag klanu","Przywódca","Data powstania","Członków"]],
		// Menus
		"sTitleMenu1":["BWE - OPTIONS","BWE - OPTIONS","BWE - OPCJE"],
		"sTitleMenu2":["BWE - BASE DE DONNÉES","BWE - DATABASE","BWE - BAZY DANYCH"],
		"sInfoMsg":
			["Un simple clic pour afficher/masquer les colonnes souhaitées dans la liste concernée.<br>Désactiver une liste désactive aussi la collecte des données de cette liste.<br>Désactiver la colonne Groupe désactive les tableaux correspondants.",
			"A single click to show/hide the columns you want on the appropriate list.<br>Disable a list also disables the collection of data from this list.<br>Disable the Group column disables the corresponding tables.",
			"Jedno kliknięcie, aby pokazać/ukryć kolumny, które mają na odpowiedniej liście.<br>Wyłącz lista wyłącza także zbierania danych z tej listy.<br>Wyłącz kolumna Grupa wyłącza odpowiednie tabele."],
		"sTitleList":["LISTES : ","LISTS : ","LISTY : "],
		"sTitleDivers":["DIVERS","MISCELLANEOUS","RÓŻNE"],
		"sActive":["Activer/Désactiver","Enable / Disable","Włącz / Wyłącz"],
		"sTitresList": [["Tableaux","Votre Profile","Autres Profiles","Vue sur la Cité","Votre Clan","Autres Clans","Liste des Clans","Classement",// 0-7
				"Messagerie","Réception","Sauvegarde","Envoi", //8-11
				"Historique","Principal","- Divers","- Caractéristiques","- Ressources"],// 12-16
			["Tables","Profile owner","Other Profiles","View of the city","Clan owner","Other Clans","List of Clans","Ranking",
			"Messaging","Reception","Safeguard","Sending",
			"History","Main","- Misc","- Characteristics","- Resources"],
			["Stoły","Twój Profil","Inne Profile","Widok na miasto","Twój Klan","Inne Klany","Lista Klanów","Ranking",
			"Wiadomości","Recepcja","Zabezpieczenie","Wysyłanie",
			"Historia","Główny","- Różny","- Charakterystyka","- Zasoby"]],
		"sTitresDiv": [["Tri liste des amis","Total des pierres","Historique : nombre de lignes","Historique : collecte des données",
			"Aide aux embuscades :","+ Niveau","+ Classement","- Minimum","- Maximum","- Ecart inférieur","- Ecart supérieur"],
			["Sort list of friends","Total stones","History: number of lines","History : data collection",
				"Help for ambushes :","Level","Ranking","- Minimum","- Maximum","- Gap lower","- Gap higher"],
			["Sortuj listę znajomych","Całkowitej kamienie","Historia: liczba linii","Historia: zbieranie danych",
				"Pomoc dla zasadzki :","Poziom","Ranking","- Minimalny","- Maksymalny","- luka niższy","- luka wyższa"]],
		"sDefaut":["Par défaut","By default","Zaocznie"],
		"sAlertMsg":
			["ATTENTION! Cette page vous permet d'effacer les données du Script. A utiliser avec précaution.",
			"WARNING! This page allows you to delete data script. Use with caution.",
			"UWAGA! Ta strona pozwala usunąć skrypt danych. Stosować z ostrożnością."],
		"sTitleLS":["BASE DE DONNEES - LOCALSTORAGE","DATABASE - LOCALSTORAGE","BAZY DANYCH - LOCALSTORAGE"],
		"sDelete":["Supprime","Delete","Usuwa"],
		"sRAZ":["RAZ","RAZ","RESET"],
		"sRazChkLS":
			["Voulez vraiment effacer l'ensemble des données Localstorage ?",
			"Really want to erase all data localStorage?",
			"Naprawdę chcesz usunąć wszystkie dane LocalStorage?"],
		"sLabelSearch":["Filtre","Filter","Filtr"],
		"sResult":["$1 résultat(s) sur $2","$1 of $2 results","$1 z $2 wyników"],
		"sTitleIE":["IMPORT/EXPORT HISTORIQUE","IMPORT/EXPORT HISTORY","PRZYWÓZ/WYWÓZ HISTORIA"],
		"sExportText":["Zone d'exportation","Export Area","Eksport przestrzeni"],
		"sExportHelp":["Cliquer sur START pour générer les données.<br>Recopier celle-ci à partir du cadre ci dessous pour les coller dans la zone import de l\\'autre navigateur.<br>Contient uniquement l\\'historique de votre vampire.",
			"Click on START to generate the data.<br>Copy it from the frame below to paste into the import area to the other browser.<br>Contains only the history of your vampire.",
			"Kliknij na START, aby wygenerować dane.<br>Skopiuj go z ramki poniżej wkleić do obszaru na przywóz do innej przeglądarki.<br>Zawiera tylko historię swojego wampira."],
		"sImportText":["Zone d'importation","Import area","Powierzchnia importu"],
		"sImportHelp":["Coller les données en provenance d\\'un autre navigateur dans ce cadre puis cliquer sur IMPORT.<br>Ne prend en compte que l\\'historique de votre vampire.",
			"Paste data from another browser in this frame then click on IMPORT.<br>Only takes into account the history of your vampire.",
			"Wklej dane z innej przeglądarki w tej ramce a następnie kliknij Import.<br>Tylko bierze pod uwagę historię swojego wampira."],
		"sOutputLog":["START","START","START"],
		"sImportLog":["IMPORT","IMPORT","PRZYWÓZ"],
		"sIEResult":["$1 résultat(s)","$1 results","$1 wyników"]
		};
	var langue; // 0 = français par défaut, 1 = anglais, 2 = polonais
	if (/^http\:\/\/r[0-9]*\.fr\.bloodwars\.net/.test(location.href)) langue = 0;
	else if (/^http\:\/\/r[0-9]*\.bloodwars\.net/.test(location.href)) langue = 1;
	else if (/^http\:\/\/r[0-9]*\.bloodwars\.interia\.pl/.test(location.href)||/^http\:\/\/beta[0-9]*\.bloodwars\.net/.test(location.href)) langue = 2;
	else langue = 0;
	return {
	//public stuff
		// Retourne la chaine ou l'expression traduite.
		// Remplace les éléments $1,$2... par les arguments transmis en complément.
		// Le caractère d'échappement '\' doit être doublé pour être pris en compte dans une expression régulière.
		// ex: "test": ["<b>$2<\/b> a tué $1 avec $3.",]
		// L._Get('test','Dr Moutarde','Mlle Rose','le chandelier'); => "<b>Mlle Rose<\/b> a tué le Dr Moutarde avec le chandelier."
		_Get: function(key){
			var result = locStr[key];
			if (!_Exist(result)) throw new Error("L::Error:: la clé n'existe pas : "+key);
			if (_Exist(result[langue])) result = result[langue];
			else result = result[0];
			for (var i=arguments.length-1;i>=1;i--){
				var reg = new RegExp("\\$"+i,"g");
				result = result.replace(reg,arguments[i]);
				}
			return result;
			}
		};
	})();

/******************************************************
* OBJET DATAS - Fonctions d'accès aux données de la page
* Chaque fonction retourne 'null' en cas d'échec
******************************************************/
var DATAS = (function(){
	// pour _Time()
	var timeDiff = null,
		stTime = new Date(),
		result = DOM._GetFirstNodeInnerHTML("/html/body/script",null),
		result2 = /var timeDiff = ([0-9]+) - Math\.floor\(stTime\.getTime\(\)\/1000\) \+ ([0-9]+) \+ stTime\.getTimezoneOffset\(\)\*60;/.exec(result);
	if (result2!=null) timeDiff = parseInt(result2[1]) - Math.floor(stTime.getTime()/1000) + parseInt(result2[2]) + stTime.getTimezoneOffset()*60;
	var _PlayerExpBar = function(){
		var stats = DOM._GetFirstNode("//div[@class='stats-player']/div[@class='expbar']"),
			player_datas = stats?stats.getAttribute('onmouseover'):null;
		return player_datas;
		};
	return {
	/* données du serveur */
		_Time: function(){
			var stTime = new Date();
			if (timeDiff!=null)	stTime.setTime((timeDiff*1000)+stTime.getTime());
			else stTime=null;
			return stTime;
			},
	/* données du joueur */
		_PlayerName: function(){
			var playerName = DOM._GetFirstNodeTextContent("//div[@class='stats-player']/a[@class='me']", null);
			return playerName;
			},
		_PlayerLevel: function(){ // Niveau => /NIVEAU ([0-9]+)/
			var playerLevel = new RegExp(L._Get('sNiveau')).exec(_PlayerExpBar());
			if (playerLevel!=null) playerLevel=parseInt((playerLevel[1]).replace(/ /g,""));
			return playerLevel;
			},
		_PlayerPdP: function(){// PdP => /PTS DE PROGRÈS: <strong>([0-9 ]+)<\/strong>/
			var playerPdP=new RegExp(L._Get('sPdP')).exec(_PlayerExpBar());
			if (playerPdP!=null) playerPdP=parseInt((playerPdP[1]).replace(/ /g,""));
			return playerPdP;
			},
	/* Données diverses	*/
		_GetPage: function(){
			var page = 'null',
			// message Serveur (à approfondir)
				result = DOM._GetFirstNode("//div[@class='komunikat']");
			if (result!=null){
				var result = DOM._GetFirstNodeTextContent(".//u",result);
				if (result == L._Get('sDeconnecte')) page="pServerDeco";
				else if (result == L._Get('sCourtePause')) page="pServerUpdate";
				else page="pServerOther";
				}
			else{
				var qsA = DOM._QueryString("a"),
					qsDo = DOM._QueryString("do"),
					qsMid = DOM._QueryString("mid"),
					path = window.location.pathname;
				// page extérieur
				if (path!="/"){}
				// page interne
				// Profile
				else if (qsA=="profile"){
					var qsUid = DOM._QueryString("uid");
					var qsEdit = DOM._QueryString("edit");
					if (qsUid==null) page="pOProfile";
					else if (!qsEdit) page="pProfile";
					}
				// Salle du Trône
				else if (qsA==null||qsA=="main") page="pMain";
				// Vue sur la Cité
				else if (qsA=="townview") page="pTownview";
				// Clan
				else if (qsA=="aliance"){
					if (qsDo=="list") page="pAlianceList";
					else if (qsDo==null||qsDo=="leave") page="pOAliance";
					else if (qsDo=="view"){
						var result = DOM._GetFirstNode("//div[@class='top-options']/span[@class='lnk']");
						if (result!=null) page="pOAliance";
						else page="pAliance";
						}
					} 
				// Le Puits des Âmes - Moria I
				else if (qsA=="mixer"){
					if (qsDo==null||qsDo=="mkstone") page="pMkstone";
					else if (qsDo=="upgitem") page="pUpgitem";
					else if (qsDo=="mixitem") page="pMixitem";
					else if (qsDo=="destitem") page="pDestitem";
					else if (qsDo=="tatoo") page="pTatoo";
					}
				// Préparer une embuscade
				else if (qsA=="ambush"){
					var qsOpt = DOM._QueryString("opt");
					if (qsOpt==null) page="pAmbushRoot";
					}
				// Page des messages
				else if (qsA=="msg"){
					var qsType = DOM._QueryString("type");
					if (qsDo==null||qsDo=="list"){
						if (qsType==null||qsType=="1") page="pMsgList";
						else if (qsType=="2") page="pMsgSaveList";
						else if (qsType=="3") page="pMsgSendList";
						}
					else if (qsDo=="fl") page="pMsgFriendList";
					else if (qsDo=="view" && qsMid!=null){
						if (qsType==null||qsType=="1") page="pMsg";
						else if (qsType=="2") page="pMsgSave";
						else if (qsType=="3") page="pMsgSend";
						}
					}
				// Page Classement
				else if (qsA=="rank") page="pRank";
				// Page Préférences
				else if (qsA=="settings"){
					if (qsDo==null) page="pRootSettings";
					else if (qsDo=="ai") page="pSettingsAi";
					else if (qsDo=="acc") page="pSettingsAcc";
					else if (qsDo=="vac") page="pSettingsVac";
					else if (qsDo=="delchar") page="pSettingsDelchar";
					}
				}
			return page;
			}
		};
	})();

/******************************************************
* OBJET PREF - Gestion des préférences
******************************************************/
var PREF = (function(){
	// préfèrences par défaut
	const index = 'BWE:O:',
		defPrefs = {
		// Tableaux - sélection des colonnes/lignes
		// sh : Affiche (0=non,1=oui), tri (0=ascendant,1=descendant)
		// list: [n°titre des colonnes (cf sColTitle),afficher{1:0},n°colonne originale(-1 si a créer)]
		// Tableaux existants
		'pOProfile':{'sh':1,'list':[[0,1,0],[1,1,1],[2,1,2],[3,1,3],[4,1,4],[5,0,5],[6,0,6],[7,1,-1],[8,0,-1],[10,1,7],[9,1,8],[4,1,9],[11,1,10],[12,1,11],[4,1,12],[13,1,13]]},
		'pProfile':{'sh':1,'list':[[0,1,0],[1,1,1],[2,1,2],[3,1,3],[4,1,4],[5,0,5],[6,0,6],[7,1,-1],[8,0,-1],[14,1,-1],[10,1,7],[9,1,8],[4,1,9],[11,1,10],[12,1,11],[4,1,12],[13,1,13]]},
		'pTownview':{'sh':1,'tri':[1,1],'list':[[28,1,1],[29,1,2],[9,1,3],[6,0,4],[5,0,-1],[7,1,-1],[23,1,-1],[24,1,5],[25,1,-1],[0,1,6],[1,0,7],[22,1,-1],[3,1,8],[30,1,9]]},
		'pOAliance':{'sh':1,'sh1':1,'sh2':1,'tri':[1,1],'list':[[15,1,1],[16,0,2],[17,1,-1],[18,1,-1],[19,1,-1],[2,1,3],[20,1,4],[5,0,5],[6,0,6],[7,1,-1],[21,0,-1],[22,1,-1],[0,1,-1],[1,0,-1],[11,0,7]]},
		'pAliance':{'sh':1,'sh1':1,'tri':[1,1],'list':[[15,1,1],[23,1,-1],[24,1,2],[25,1,-1],[2,1,3],[20,1,4],[5,0,5],[6,0,6],[7,1,-1],[21,0,-1],[22,1,-1],[0,1,-1],[1,0,-1],[11,0,7]]},
		'pAlianceList':{'sh':1,'list':[[66,1,1],[67,1,2],[68,1,3],[69,1,4],[70,1,5],[71,1,6],[6,1,7]]},
		'pMsgList':{'sh':0,'tri':[4,0],'list':[[62,1,1],[63,1,2],[64,1,3],[65,1,4]]},
		'pMsgSaveList':{'sh':0,'tri':[4,0],'list':[[62,1,1],[63,1,2],[64,1,3],[65,1,4]]},
		'pMsgSendList':{'sh':0,'tri':[4,0],'list':[[62,1,1],[63,1,2],[64,1,3],[65,1,4]]},
		'pMsgFriendList':{'sh':1,'tri':[1,1],'list':[[-1,1,1],[-1,1,2]]},
		'pRank':{'sh':1,'tri':[1,1],'list':[[26,1,1],[27,1,2],[0,1,3],[1,0,4],[22,1,-1],[23,1,-1],[24,1,5],[25,1,-1],[2,1,6],[3,1,7],[5,0,-1],[6,0,8],[7,1,-1]]},
		// tableaux à créer
		'grp':{'sh':1,'tri':[1,1]},
		'hlog':{'list':[[31,1],[32,1],[33,1],[34,1],[35,1],[36,1]]},
		'hdiv':{'list':[[37,1],[38,1],[39,1],[40,1],[41,1],[42,1]]},
		'hch':{'list':[[43,0],[44,0],[45,1],[46,0],[47,1],[48,1],[49,0],[50,1],[51,1],[52,1],[53,0],[54,0],[55,0]]},
		'hres':{'list':[[56,1],[57,1],[58,1],[59,1],[60,1],[61,1]]},
		// Aide Embucasde
		'AE':{'sh':0,'nMin':'','nMax':'','aMin':'','aMax':'','cMin':'','cMax':'','acMin':'','acMax':''},
		// Divers : stones, nbre de ligne du log,collecte log
		'div':{'chSt':1,'nbLo':4,'chLo':1}
		};
	var ID = null, prefs = {};
	return {
		_Init: function(id){
			ID = id;
			prefs = LS._GetVar(index+ID,{});
			},
		_Get: function(grp,key){
			if (_Exist(prefs[grp])&&_Exist(prefs[grp][key])) return prefs[grp][key];
			else if (_Exist(defPrefs[grp])&&_Exist(defPrefs[grp][key]))return defPrefs[grp][key];
			else return null;
			},
		_Set: function(grp,key,value){
			if (ID!=null){
				if (!_Exist(prefs[grp])) prefs[grp] = {};
				prefs[grp][key] = value;
				LS._SetVar(index+ID,prefs);
				}
			},
		_Raz: function(){
			prefs = {};
			LS._Delete(index+ID);
			}
		};
	})();

/******************************************************
* CSS
******************************************************/
function SetCSS(){
	const css = "@-moz-keyframes blinker {from {opacity:1;} 50% {opacity:0.1;} to {opacity:1;}}"
		+"@-webkit-keyframes blinker {from {opacity:1;} to {opacity:0;}}"
		+".BWEblink {-webkit-animation-name: blinker;-webkit-animation-iteration-count: infinite;-webkit-animation-timing-function: cubic-bezier(1.0,0,0,1.0);-webkit-animation-duration: 1s;"
		+"-moz-animation-name: blinker;-moz-animation-iteration-count: infinite;-moz-animation-timing-function: cubic-bezier(1.0,0,0,1.0);-moz-animation-duration: 1s;}"
		+".BWEtriSelect{color:lime;}"
		+".BWEOpacity{opacity:1;}"
		+".BWEtriNoSelect{color:#A9A9A9;}"
		+".BWEsexF{color:#AD00A5;}"
		+".BWEsexH{color:#006BAD;}"
		+".BWEAEBut,.BWEAEButError{height:10px;margin:2px 0;}"
		+".BWEAEButError{background-color:red;}"
		+".BWEHelp{border:0;vertical-align:middle;padding:3px 5px;}"
		+".BWELeft,.BWERight,.BWEMiddle,.BWELeftHeader,.BWEMiddleHeader,.BWELogTD,.BWEGrpChg,.BWEGrpDel{padding:1px;text-align:left;white-space:nowrap;}"
		+".BWELogTD2{padding:1px 4px;text-align:left;white-space:nowrap;}"
		+".BWELeft2{padding: 0 10px;text-align:left;}"
		+".BWEGrpChg,.BWEGrpDel{color:#FFF;background-color:#F07000;border:thin solid #000;}"
		+".BWEGrpDel{color:#FFF;background-color:red;}"
		+".BWELogTD{border:thin dotted #000;}"
		+".BWERight{text-align:right;}"
		+".BWEMiddle,.BWEMiddleHeader,.BWEGrpChg,.BWEGrpDel{text-align:center;}"
		+".BWEGrpChg,.BWEGrpDel,.BWEPrefTD1,.BWEbold{font-weight:700;}"
		+".BWEMenu,.BWETabMsg{margin-left:auto;margin-right:auto;padding:0;border-collapse:collapse;}"
		+".BWELeftHeader,.BWEMiddleHeader,.BWEGrpChg,.BWEGrpDel,.BWEPrefTD2,.BWEPrefTD3 a{cursor: pointer;}"
		+".BWEPrefTD1,.BWEPrefTD2,.BWEPrefTD3{padding: 1px;text-align:left;white-space: nowrap;}"
		+".BWEPrefTD3{width:10px;}"
		+".BWEselectLS,.BWEdivLS,.BWEdivIE{width:20em;height:20em;margin:0;}"
		+".BWEdivLS,.BWEdivIE{overflow:auto;word-wrap:break-word;white-space:normal;}",
		head = DOM._GetFirstNode("//head");
	if (head!=null) IU._CreateElement('style',{'type':'text/css'},[css],{},head);
	}


/******************************************************
* FUNCTIONS
******************************************************/
// Historique des embuscades
function UpdateHistory(att,def,msgId,msgDate,emb){
	var h = LS._GetVar('BWE:L:'+att+':'+def,[]),
		a = msgId,
		b = (_Type(msgDate)=='Date')?msgDate.getTime():null,
		c = emb;
	for(var i=0;i<PREF._Get('div','nbLo');i++){
		if (_Exist(h[i])){
			if (a!=h[i][0]){// message différent
				if (b!=null&&b>h[i][1]){//message plus récent.
					var temp = [a,b,c];
					a = h[i][0];
					b = h[i][1];
					c = h[i][2];
					h[i] = temp;
					}
				}
			else{// message identique.
				if (c!=null) h[i][2] = c;
				break;
				}
			}
		else{// pas de ligne à cette position.
			if (b!=null) h[i] = [a,b,c];
			break;
			}
		}
	if (h.length>PREF._Get('div','nbLo')) h = h.slice(0,PREF._Get('div','nbLo'));
	if (h.length>0)	LS._SetVar('BWE:L:'+att+':'+def,h);
	}
function CreateHistory(att,def,node){
	// créé l'historique à la volée
	function CreateOverlib(e,i){ // i[0] = att, i[1] = def, i[0] = result['span'], 
		var	histoIU = {'root':['div'],
			'table':['table',{'style':'border-collapse:collapse;'},,,'root'],
			'tr':['tr',{'class':'tblheader'},,,'table']},
			histo = IU._CreateElements(histoIU);
		var logCol = clone(PREF._Get('hlog','list'));
		for (var x=0;x<logCol.length;x++){
			if (logCol[x][1]!=1){logCol.splice(x,1);x--;}
			else{IU._CreateElement('th',{'class':'BWELogTD'},[L._Get("sColTitle")[logCol[x][0]]],{},histo['tr']);}
			}
		var j=0, h = LS._GetVar('BWE:L:'+i[0]+':'+i[1],[]);
		while (_Exist(h[j])&&j<nbLog){
			var overlib = IU._CreateElement('tr',{'class':(j%2==0?'even':'')},[],{},histo['table']);
			if (h[j][2]!=null&&_Exist(h[j][2][1])){
				for (var x=0; x<logCol.length; x++){
					var col = logCol[x][0]-31,
						newTD = IU._CreateElement('td',{'class':'BWELogTD','style':'vertical-align:top'},[],{},overlib);
					if (col==0){ // n°
						var	bgcolor = h[j][2][1]=='r'?'#707070'
								:h[j][2][1]=='n'?'#F07000'
								:h[j][2][1]=='v'?i[0]==ID?'#2A9F2A':'#DB0B32'
								:h[j][2][1]=='d'?i[0]==ID?'#DB0B32':'#2A9F2A'
								:'white';
						newTD.setAttribute('style','background-color:'+bgcolor+';vertical-align:middle;text-align:center;');
						newTD.textContent = j;
						}
					else if (col==1){ // Divers
						var div = PREF._Get('hdiv','list'),
							table = IU._CreateElement('table',{},[],{},newTD);
						for (var y=0; y<div.length; y++){
							if (div[y][1]==1){
								var ligne = div[y][0]-37,
									datas = '', tdClass = "BWELogTD2";
								if (ligne==0){datas = (new Date(h[j][1])).toLocaleDateString();} // date
								else if (ligne==1&&h[j][2][0]!=''){datas = h[j][2][0]+'%';} // emb
								else if (ligne==2&&h[j][2][2]!=''){datas = h[j][2][2];tdClass = "atkHit BWELogTD2";} // PV Att.
								else if (ligne==3&&h[j][2][3]!=''){datas = h[j][2][3];tdClass = "defHit BWELogTD2";} // PV Déf.
								else if (ligne==4&&h[j][2][10].length>0){h[j][2][10].forEach(function(e){datas+=L._Get('sObjet')[e]+' ';});} // Objet Att.
								else if (ligne==5&&h[j][2][11].length>0){h[j][2][11].forEach(function(e){datas+=L._Get('sObjet')[e]+' ';});} // Objet Def.
								if (datas!='') IU._CreateElements({'tr':['tr',,,,table],'td1':['td',{'class':'BWEbold'},[L._Get('sColTitle')[div[y][0]]],,'tr'],'td2':['td',{'class':tdClass},[datas],,'tr']});
								}
							}
						}
					else if (col==2){ // Arcanes
						var table = IU._CreateElement('table',{},[],{},newTD),
							arcA = h[j][2][4], arcB = h[j][2][5], arc = {};
							for (var y=0;y<arcA.length;y++){arc[arcA[y][0]] = []; arc[arcA[y][0]][0] = arcA[y][1];}
							for (var y=0;y<arcB.length;y++){arc[arcB[y][0]] = _Exist(arc[arcB[y][0]])?arc[arcB[y][0]]:[]; arc[arcB[y][0]][1] = arcB[y][1];}
							for (var key in arc){
								IU._CreateElements({'tr':['tr',,,,table],'td1':['td',{'class':'BWEbold'},[L._Get('sArc')[key]],,'tr'],
									'td2':['td',{'class':'atkHit BWELogTD2'},[_Exist(arc[key][0])?arc[key][0]:''],,'tr'],
									'td3':['td',{'class':'defHit BWELogTD2'},[_Exist(arc[key][1])?arc[key][1]:''],,'tr']});
								}
						}
					else if (col==3){ // Evolutions
						var table = IU._CreateElement('table',{},[],{},newTD),
							evoA = h[j][2][6], evoB = h[j][2][7], evo = {};
							for (var y=0;y<evoA.length;y++){evo[evoA[y][0]] = []; evo[evoA[y][0]][0] = evoA[y][1];}
							for (var y=0;y<evoB.length;y++){evo[evoB[y][0]] = _Exist(evo[evoB[y][0]])?evo[evoB[y][0]]:[]; evo[evoB[y][0]][1] = evoB[y][1];}
							for (var key in evo){
								IU._CreateElements({'tr':['tr',,,,table],'td1':['td',{'class':'BWEbold'},[L._Get('sEvo')[key]],,'tr'],
									'td2':['td',{'class':'atkHit BWELogTD2'},[_Exist(evo[key][0])?evo[key][0]:''],,'tr'],
									'td3':['td',{'class':'defHit BWELogTD2'},[_Exist(evo[key][1])?evo[key][1]:''],,'tr']});
								}
						}
					else if (col==4){ // Caractéristiques
						var table = IU._CreateElement('table',{},[],{},newTD),
							ch = PREF._Get('hch','list'),
							chA = h[j][2][8], chB = h[j][2][9];
						for (var y=0;y<ch.length;y++){
							var index = ch[y][0]-43,
								cA = _Exist(chA[index])&&chA[index]!=null?chA[index]:'',
								cB = _Exist(chB[index])&&chB[index]!=null?chB[index]:'';
							if (ch[y][1]==1&&(cA!=''||cB!='')){
								IU._CreateElements({'tr':['tr',,,,table],'td1':['td',{'class':'BWEbold'},[L._Get('sColTitle')[ch[y][0]]],,'tr'],
									'td2':['td',{'class':'atkHit BWELogTD2'},[_Exist(chA[index])?chA[index]:''],,'tr'],
									'td3':['td',{'class':'defHit BWELogTD2'},[_Exist(chB[index])?chB[index]:''],,'tr']});
								}
							}
						}
					else if (col==5&&h[j][2][12].length>0){ // Ressources
						var Ga = PREF._Get('hres','list'),
							table = IU._CreateElement('table',{},[],{},newTD),
							res = h[j][2][12];
						for (var y=0;y<Ga.length;y++){
							var datas = _Exist(res[Ga[y][0]-56])?res[Ga[y][0]-56]:null;
							if (Ga[y][1]==1&&datas!=null){
								IU._CreateElements({'tr':['tr',,,,table],'td1':['td',{'class':'BWEbold'},[L._Get('sColTitle')[Ga[y][0]]],,'tr'],'td2':['td',{'class':'BWELogTD2'},[datas],,'tr']});
								}
							}
						}
					}
				}
			else if (logCol.length>=1) IU._CreateElement('td',{'class':'BWELogTD2','style':'background-color:white;color:black;','colspan':logCol.length},[L._Get('sLogNC')],{},overlib);
			j++;
			}
		IU._removeEvent(i[2],'mouseover',CreateOverlib);
		i[2].setAttribute('onmouseover',"return overlib('"+histo['root'].innerHTML+"',CAPTION,'"+L._Get('sLogVS',i[0]==ID?player:i[0],i[1]==ID?player:i[1])+"',CAPTIONFONTCLASS,'action-caption',RELX,10,WRAP);");
		i[2].onmouseover();
		}
	var actuTime = DATAS._Time(), 
		h = LS._GetVar('BWE:L:'+att+':'+def,[]),
		nbLog = PREF._Get('div','nbLo');
	if (actuTime!=null&&_Exist(h[0])&&_Exist(h[0][1])&&nbLog>0){
		//prépare les éléments de l'historique
		var actuH = 0, j=0,
			delay = (actuTime.getTime()-h[0][1])/1000,
			delayABS = Math.abs(delay);
		delay = delayABS<60?L._Get('sLogTime1',Math.floor(delay))
			:delayABS<3600?L._Get('sLogTime2',Math.floor(delay/60))
			:delayABS<86400?L._Get('sLogTime3',Math.floor(delay/(3600)))
			:delayABS<31536000?L._Get('sLogTime4',Math.floor(delay/(86400)))
			:L._Get('sLogTime5');
		var resultIU = {
			'span':['span',{'id':'BWEOL','onmouseout':'nd();'},,,node],
			'table':['table',{'style':'display:inline;'},,,'span'],
			'tr':['tr',,,,'table'],
			'td1':['td',{'class':'BWEbold'},[delay],,'tr'],
			'td2':['td',,,,'tr'],
			'table2':['table',,,,'td2']},
			result = IU._CreateElements(resultIU);
		IU._addEvent(result['span'],'mouseover',CreateOverlib,[att,def,result['span']]);
		while (_Exist(h[j])&&_Exist(h[j][1])&&j<nbLog){
			var bgcolor = h[j][2]!=null&&_Exist(h[j][2][1])?h[j][2][1]=='r'?'#707070'
					:h[j][2][1]=='n'?'#F07000'
					:h[j][2][1]=='v'?att==ID?'#2A9F2A':'#DB0B32'
					:h[j][2][1]=='d'?att==ID?'#DB0B32':'#2A9F2A'
					:'white':'white';
			if (j==0) result['td1'].setAttribute('style','color:'+bgcolor+';');
			IU._CreateElements({'tr':['tr',,,,result['table2']],
								'td':['td',{'style':'background-color:transparent;padding:1px 0 0 0;'},,,'tr'],
								'div':['div',{'style':'height:3px;width:4px;background-color:'+bgcolor+';'},,,'td']});
			if (new Date(h[j][1]).toDateString()==actuTime.toDateString()) actuH++;
			j++;
			}
		if (actuH>=2) result['td1'].textContent = '*'+result['td1'].textContent;
		}
	else node.textContent = '-';
	}
// Gestion des groupes
// Pages Clan et Profil
function createGrpTable(grId){
	function clickRaz(e,i){
		var	list = DOM._GetNodes("//tbody[@id='BWEgrp"+i[0]+"body']/tr");
		if (list!=null){
			for (var j=0;j<list.snapshotLength;j++){
				var name = unescape(list.snapshotItem(j).getAttribute('id'));
				name = name.substring(10,name.length);
				checkGrp(null,[name,i[0]]);
				}
			}
		}
	function clickCol(e,i){ // i[0] = col
		var headerA = DOM._GetFirstNode("//tr[@id='BWEgrpAheader']"),
			headerB = DOM._GetFirstNode("//tr[@id='BWEgrpBheader']"),
			tbodyA =  DOM._GetFirstNode("//tbody[@id='BWEgrpAbody']"),
			tbodyB =  DOM._GetFirstNode("//tbody[@id='BWEgrpBbody']"),
			listA = DOM._GetNodes("./tr",tbodyA),
			listB = DOM._GetNodes("./tr",tbodyB),
			tri = PREF._Get('grp','tri'),
			oldColA = DOM._GetFirstNode("./th["+tri[0]+"]/span",headerA),
			oldColB = DOM._GetFirstNode("./th["+tri[0]+"]/span",headerB),
			newColA = DOM._GetFirstNode("./th["+i[0]+"]",headerA),
			newColB = DOM._GetFirstNode("./th["+i[0]+"]",headerB);
		if (oldColA!=null&&newColA!=null&&oldColB!=null&&newColB!=null){
			tri[1] = (i[0]==tri[0]&&tri[1]==1)?0:1;
			tri[0] = i[0];
			PREF._Set('grp','tri',tri);
			oldColA.parentNode.removeChild(oldColA);
			oldColB.parentNode.removeChild(oldColB);
			IU._CreateElement('span',{'class':'BWEtriSelect'},[(tri[1]==1?L._Get('sTriUp'):L._Get('sTriDown'))],{},newColA);
			IU._CreateElement('span',{'class':'BWEtriSelect'},[(tri[1]==1?L._Get('sTriUp'):L._Get('sTriDown'))],{},newColB);
			if (listA!=null) FctTriA(tri[0],tri[1],tbodyA,listA);
			if (listB!=null) FctTriA(tri[0],tri[1],tbodyB,listB);
			}
		}
	var result = DOM._GetFirstNode("//td[@id='BWEgrp"+grId+"']");
	if (result!=null){
		var grpIU = {
			'table':['table',{'class':'profile-stats','style':'width:100%','id':'BWEgrp'+grId+'table'},,,result],
			'thead':['thead',,,,'table'],
			'th00':['tr',,,,'thead'],
			'td001':['th',{'class':'BWEbold BWELeft','colspan':'3'},[L._Get('BWEgrp'+grId)],,'th00'],
			'td002':['th',{'class':'BWEGrpDel','colspan':'2'},[L._Get('sRAZ')],{'click':[clickRaz,[grId]]},'th00'],
			'th01':['tr',{'class':'tblheader','id':'BWEgrp'+grId+'header'},,,'thead'],
			'tdh011':['th',{'class':'BWEbold BWELeftHeader','style':'width:33%'},[L._Get('sColTitle')[27]],{'click':[clickCol,[1]]},'th01'],
			'tdh012':['th',{'class':'BWEbold BWELeftHeader','style':'width:33%'},[L._Get('sColTitle')[0]],{'click':[clickCol,[2]]},'th01'],
			'tdh013':['th',{'class':'BWEbold BWELeftHeader','style':'width:13%'},[L._Get('sColTitle')[7]],{'click':[clickCol,[3]]},'th01'],
			'tdh015':['th',{'class':'BWEbold BWERight','style':'width:21%','colspan':'2'},[L._Get('BWEgrpAct')],,'th01'],
			'tbody':['tbody',{'id':'BWEgrp'+grId+'body'},,,'table'],
			'tfoot':['tfoot',,,,'table'],
			'trf00':['tr',,,,'tfoot'],
			'tdf000':['td',{'style':'height: 10px;','colspan':'5'},,,'trf00'],
			'trf01':['tr',,,,'tfoot'],
			'tdf010':['td',{'class':'BWEbold BWELeft','id':'BWEgrp'+grId+'_foot10'},,,'trf01'],
			'tdf011':['td',{'class':'BWERight'},[L._Get('BWEgrpTt')],,'trf01'],
			'tdf012':['td',{'class':'BWEbold BWELeft','id':'BWEgrp'+grId+'_foot12'},,,'trf01'],
			'tdf013':['td',{'class':'BWEbold BWELeft','id':'BWEgrp'+grId+'_foot13','colspan':'2'},,,'trf01'],
			'trf02':['tr',,,,'tfoot'],
			'tdf020':['td',{'class':'BWELeft','id':'BWEgrp'+grId+'_foot20'},,,'trf02'],
			'tdf021':['td',{'class':'BWERight'},[L._Get('BWEgrpMoy')],,'trf02'],
			'tdf022':['td',{'class':'BWEbold BWELeft','id':'BWEgrp'+grId+'_foot22'},,,'trf02'],
			'tdf023':['td',{'class':'BWEbold BWELeft','id':'BWEgrp'+grId+'_foot23','colspan':'2'},,,'trf02']
			},
			grpNode = IU._CreateElements(grpIU);
		var grp = LS._GetVar('BWE:G',{'A':[],'B':[]});
		for (var i=0;i<grp[grId].length;i++){
			appendGrpRow(grpNode['tbody'],grp[grId][i],grId);
			}
		var tri = PREF._Get('grp','tri');
		IU._CreateElement('span',{'class':'BWEtriSelect'},[(tri[1]==1?L._Get('sTriUp'):L._Get('sTriDown'))],{},grpNode['tdh01'+tri[0]]);
		FctTriA(tri[0],tri[1],grpNode['tbody'],DOM._GetNodes("./tr",grpNode['tbody']));
		updateGrpFoot(grId);
		}
	}
function checkGrp(e,i){// i[0] = name, i[1] = id
	var grp = LS._GetVar('BWE:G',{'A':[],'B':[]}),
		grId = grp['A'].indexOf(i[0])>-1?'A':grp['B'].indexOf(i[0])>-1?'B':'',
		tri = PREF._Get('grp','tri');
	if (grId!=''){
		var	grpRow = DOM._GetFirstNode("//tr[@id='"+escape('BWEgrp'+grId+'tr_'+i[0])+"']");
		if (grpRow!=null) grpRow.parentNode.removeChild(grpRow);
		var	tbody = DOM._GetFirstNode("//tbody[@id='BWEgrp"+grId+"body']");
		if (tbody!=null) FctTriA(tri[0],tri[1],tbody,DOM._GetNodes("./tr",tbody));
		updateGrpFoot(grId);
		grp[grId].splice(grp[grId].indexOf(i[0]),1);
		}
	if (grId==i[1]) grId='';
	else{
		var	tbody = DOM._GetFirstNode("//tbody[@id='BWEgrp"+i[1]+"body']");
		if (tbody!=null){
			appendGrpRow(tbody,i[0],i[1]);
			FctTriA(tri[0],tri[1],tbody,DOM._GetNodes("./tr",tbody));
			}
		updateGrpFoot(i[1]);
		grp[i[1]].push(i[0]);
		grId = i[1];
		}
	LS._SetVar('BWE:G',grp);
	var checkA = DOM._GetFirstNode("//input[@id='"+escape('BWEcheckA_'+i[0])+"']"),
		checkB = DOM._GetFirstNode("//input[@id='"+escape('BWEcheckB_'+i[0])+"']");
	if (checkA!=null) checkA.checked = grId=='A'?true:false;
	if (checkB!=null) checkB.checked = grId=='B'?true:false;
	}
function appendGrpRow(tbody,name,grId){
	var value = LS._GetVar('BWE:P:'+name,{}),
		races = L._Get('sRaces'),
		race = _Exist(value['R']&&_Exist(races[value['R']]))?(races[value['R']].length>13?races[value['R']].substr(0,10)+'...':races[value['R']]):'-';
	var trIU = {
		'tr01':['tr',{'id':escape('BWEgrp'+grId+'tr_'+name)},,,tbody],
		'td010':['td',{'class':'BWELeft'},,,'tr01'],
		'a0100':['a',(_Exist(value['U'])?{'href':'?a=profile&uid='+value['U']}:{}),[(name.length>13?name.substr(0,10)+'...':name)],,'td010'],
		'td011':['td',{'class':'BWELeft'},[race],,'tr01'],
		'td012':['td',{'class':'BWELeft'},[(_Exist(value['N'])&&_Exist(value['P']))?value['N']+' ('+value['P']+')':'-'],,'tr01'],
		'td013':['td',{'class':'BWEGrpChg'},[('->'+(grId=='A'?'B':'A'))],{'click':[checkGrp,[name,(grId=='A'?'B':'A')]]},'tr01'],
		'td014':['td',{'class':'BWEGrpDel'},['X'],{'click':[checkGrp,[name,grId]]},'tr01']
		};
	IU._CreateElements(trIU);
	}
function updateGrpFoot(grId){
	var	list = DOM._GetNodes("//tbody[@id='BWEgrp"+grId+"body']/tr"),
		lvlsum = 0,	ptssum = 0;
	if (list!=null){
		for (var i=0;i<list.snapshotLength;i++){
			var result = new RegExp(L._Get('sTriPtsTest')).exec(DOM._GetFirstNodeTextContent("./td[3]",null,list.snapshotItem(i)));
			if (result!=null){
				lvlsum+=Number(parseInt(result[1]));
				ptssum+=Number(parseInt(result[2]));
				}
			}
		var nb = list.snapshotLength,
			fnb = DOM._GetFirstNode("//td[@id='BWEgrp"+grId+"_foot10']"),
			flvlsum = DOM._GetFirstNode("//td[@id='BWEgrp"+grId+"_foot12']"),
			fptssum = DOM._GetFirstNode("//td[@id='BWEgrp"+grId+"_foot13']"),
			flvlaverage = DOM._GetFirstNode("//td[@id='BWEgrp"+grId+"_foot22']"),
			fptsaverage = DOM._GetFirstNode("//td[@id='BWEgrp"+grId+"_foot23']");
		if (fnb!=null) fnb.textContent = (nb>1?L._Get('BWEgrpPls',nb):L._Get('BWEgrpPl',nb));
		if (flvlsum!=null) flvlsum.textContent = lvlsum;
		if (fptssum!=null) fptssum.textContent = ptssum;
		if (flvlaverage!=null) flvlaverage.textContent = nb>0?Math.floor(lvlsum/nb):0;
		if (fptsaverage!=null) fptsaverage.textContent = nb>0?Math.floor(ptssum/nb):0;
		}
	}
function showHideGr(e,i){//i[0]= node title,i[1]= node trA,i[2]= node trB
	var show = PREF._Get('grp','sh')==1?0:1;
	PREF._Set('grp','sh',show);
	i['1'].setAttribute('style','display:'+(show==1?'table-row;':'none;'));
	i['2'].setAttribute('style','display:'+(show==1?'table-row;':'none;'));
	i[0].setAttribute('style','color:'+(show==1?'lime;':'red;')+';cursor: pointer;');
	}
// Alimente un tableau déjà créé au format suivant :
// - table ('id':'BWE'+index+'table')
// - head (child de table) -> tr ('id':'BWE'+index+'header')
// - tbody (child de table,'id':'BWE'+index+'body')
// header = ancien en-tête, list = liste des TR du tableau à copier
function CreateTable(header,list,index){
	function clickCol(e,i){ // i[0] = col, i[1] = index
		var header = DOM._GetFirstNode("//tr[@id='BWE"+i[1]+"header']"),
			tbody =  DOM._GetFirstNode("//tbody[@id='BWE"+i[1]+"body']"),
			list = DOM._GetNodes("./tr",tbody),
			tri = PREF._Get(i[1],'tri'),
			oldCol = DOM._GetFirstNode("./td["+tri[0]+"]/span",header),
			newCol = DOM._GetFirstNode("./td["+i[0]+"]",header);
		if (oldCol!=null&&newCol!=null){
			tri[1] = (i[0]==tri[0]&&tri[1]==1)?0:1;
			tri[0] = i[0];
			PREF._Set(i[1],'tri',tri);
			oldCol.parentNode.removeChild(oldCol);
			IU._CreateElement('span',{'class':'BWEtriSelect'},[(tri[1]==1?L._Get('sTriUp'):L._Get('sTriDown'))],{},newCol);
			if (list!=null) FctTriA(tri[0],tri[1],tbody,list);
			}
		}
	function GetLvl(value){
		if (!isNaN(value)&&parseInt(value)==Number(value)){
			var lvl = Math.floor(Math.log(1.1*value)/Math.log(1.1)),
				lvlSup = Math.floor(Math.log(0.0011*(value*1000+999))/Math.log(1.1));
			return new Array(lvl,lvlSup,(lvl!=lvlSup?lvl+"-"+lvlSup:lvl));
			}
		else return new Array('-','-','-');
		}
	var newHead = DOM._GetFirstNode("//tr[@id='BWE"+index+"header']"),
		newBody = DOM._GetFirstNode("//tbody[@id='BWE"+index+"body']");
	if (newHead!=null&&newBody!=null){
		var newCol = clone(PREF._Get(index,'list')),
			tri = PREF._Get(index,'tri');
		// création et suppression des en-têtes inutiles
		for (var i=0; i<newCol.length; i++){
			if (newCol[i][1]!=1){newCol.splice(i,1);i--;}
			else{
				var newTD = IU._CreateElement('td',{'class':(tri!=null?'BWELeftHeader':'BWELeft')},[],{}),
					col = newCol[i][0];
				if (newCol[i][2]!=-1){ // en-tête existante
					var td = DOM._GetFirstNode("./td["+newCol[i][2]+"]",header);
					if (td!=null){
						newTD = td.cloneNode(true);
						if ([62,65].indexOf(col)==-1) newTD.removeAttribute('width');
						newTD.removeAttribute('style'); 
						newTD.className += (newTD.className?' ':'')+(tri==null?'BWELeft':([28,62].indexOf(col)==-1)?'BWELeftHeader':'BWEMiddleHeader');
						}
					}
				else{ // en-tête à créer
					if ([1,17,18,19,21,22].indexOf(col)!=-1) newTD.className = tri!=null?'BWEMiddleHeader':'BWEMiddle';
					// récupère le titre sauf pr quelques exceptions
					if ([-1,17,18,19,22].indexOf(col)==-1) newTD.textContent = L._Get("sColTitle")[col];
					if (col==21) newTD.setAttribute('id','BWEgrpcol');
					if (col==22) IU._CreateElement('img',{'style':"width:16px; height:16px; vertical-align:middle;",'src':"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%06%00%00%00%1F%F3%FFa%00%00%02%1FIDATx%DAcd%20%12%9C%3CyB%FF%F2%E5%CB5%3F%7F%FE%D2%FA%F7%FF%9F%D6%E9S%A7%E7-Z%B4(%99%91X%03v%ED%DA%C1%EF%E6%E6%F1q%CA%94I%FF%BF%7D%FF%CE%B0w%EF%DE%AE%9D%3Bv%95%E34%E0%DA%B5%AB%F6%BF%7F%FDb%F8%F9%EB%D7%0333%F3%87%13%26%F4%E9%0B%89%08%1Dx%FB%E6%9D%C0%D7%AF_%18%0E%1E8%5C%BB%7B%F7%EE%16%0C%03v%ED%DC%11%FF%EF%DF%FFI%CF%9E%3D%E1%FB%F9%E3%17%03%03P%C5%DF%7F%7FO%B0%B1%B1i%BC%FF%F0%9E%E9%E3%C7%8F~m%AD%1D%07%DD%DD%DD3w%EE%DC9%1D%C5%80%E3%C7%0F%FB%3F%7C%F8d%C3%B3%A7O.%FC%FC%F9%A3%E1%DB%B7o%1F~%FC%FC%E5%A0%A8%A8X%F0%FD%FBw%81%5B%B7n9%CC%9C9%FB%20%B2%1E%14%03%E6%CF%9B%F7%F8%DE%FD%BBo%9A%9B%5B%0D%91%C5%17%2C%9Co%FF%EB%D7%AF%03%87%0E%1FnZ%B2hI%3DV%03f%CC%9C%AE%FF%E3%DB%F7%0B%17%2F_J%98%3Fo%C1Bt%AF%B5%B4%B6%9C%BF%7F%FF%DE%87%B9s%E69b5%A0%B5%AD%D5%FE%FB%D7%AF%07._%BD%E2%B0q%C3%A6%83%E8%06%14%97%14%ED%7F%F7%F6%1D%C3%FC%F9%0B%B0%1B%60hl%C8ook%FF%E1%E6%AD%9B%0B%B6o%DB%9E%88%AC%C8%DB%CF%9B_%5DU%ED%C1%B3%E7%CF7%ACX%B6%22%11%AB%01%20%10%9F%10%3F%FF%DB%D7o%09%2C%AC%2C%05%CB%97-%9F%08%12%B3s%B0%E3WQV9%C0%CE%CEnp%FD%C6u%87%03%FB%0E%E0%0ED%0F%2F%0F~nN%AE%03%9C%9C%9C%06%BF%FF%FCy%F0%EF%DF%BF%07%2C%CC%CC%0El%EC%EC%0C%EF%DE%BDI%D8%BCi%2BF%D8%60MH%F6%0E%F6%F1%26%C6%26%09%8F%1E%3Dr%F8%FA%ED%EB%84%E7%2F%9EO8%7F%F6%FCCljq%A6%C4%9E%DE%9E%FA%FD%07%F67l%DD%BC%15or%C7*%99%98%98x%FC%C7%8F%1F%16_%BF%7CaP%D7%D0%60%B8z%EDj%FF%B6%AD%DB%8AHr%01%08%B8%B9%B9%FD%DF%B5k%17%E9.%80%01%5B%3B%DB%FF%87%0F%1D%C6%AB%06%00%A2%EE%06%20%5B%F9%3D%19%00%00%00%00IEND%AEB%60%82"},[],{},newTD);
					}
				// Event de tri si possible
				if (tri!=null) IU._addEvent(newTD,'click',clickCol,[i+1,index]);
				newHead.appendChild(newTD);
				}
			}
		// création tbody
		for (var j=0; j<list.snapshotLength; j++){
			// mise à jour des données
			var oldTR = list.snapshotItem(j),
				newTR = newBody.appendChild(oldTR.cloneNode(false)),
				nameSearch = (index=='pTownview'||index=='pRank')?".//td[2]/a":((index=='pOAliance'||index=='pAliance')?".//td[1]/a":null),
				name = nameSearch!=null?DOM._GetFirstNodeTextContent(nameSearch,null,oldTR):null;
			if (name!=null){
				var value = LS._GetVar('BWE:P:'+name,{});
				if (index=='pTownview'||index=='pRank'){
					var pts = DOM._GetFirstNodeTextContent(".//td["+(index=='pTownview'?4:8)+"]",null,oldTR),
						race = DOM._GetFirstNodeTextContent(".//td["+(index=='pTownview'?6:3)+"]",null,oldTR),
						sexe = DOM._GetFirstNodeTextContent(".//td["+(index=='pTownview'?7:4)+"]",null,oldTR);
					if (pts!=null){
						value['P'] = Number(pts);
						if (!_Exist(value['N'])||(_Exist(value['N'])&&value['N']<GetLvl(value['P'])[0])) value['N']=GetLvl(value['P'])[2];
						}
					if (race!=null) value['R'] = L._Get('sRaces').indexOf(race);
					if (sexe!=null) value['S'] = sexe;
					if (index=='pRank'&&name==player){
						var rank = DOM._GetFirstNodeTextContent(".//td[1]",null,oldTR);
						value['C'] = Number(rank);
						}
					}
				else if (index=='pOAliance'||index=='pAliance'){
					var niv = DOM._GetFirstNodeTextContent(".//td[5]",null,oldTR),
						pts = DOM._GetFirstNodeTextContent(".//td[6]",null,oldTR);
					if (niv!=null) value['N'] = niv;
					if (pts!=null) value['P'] = Number(pts);
					}
				var uid = /^\?a=profile&uid=(\d*)$/.exec(DOM._GetFirstNode(nameSearch,oldTR).getAttribute('href'));
				if (uid!=null) value['U'] = uid[1];
				LS._SetVar('BWE:P:'+name,value);
				}
			for (var i=0; i<newCol.length; i++){
				var newTD, col = newCol[i][0];
				if (newCol[i][2]!=-1){ // colonne existante
					var td = DOM._GetFirstNode(".//td["+newCol[i][2]+"]",oldTR);
					if (td!=null){
						newTD = newTR.appendChild(td.cloneNode(true));
						newTD.removeAttribute('width');
						newTD.removeAttribute('style'); 
						newTD.className += (newTD.className?' ':'')+([62].indexOf(col)==-1?'BWELeft':'BWEMiddle');
						}
					if (col==24){
						newTD.setAttribute('width','18px');
						if (j>=0&&name!=null&&PREF._Get('AE','sh')==1){
							var	img = DOM._GetFirstNode(".//img",newTD);
							if (img!=null&&img.src.indexOf('/0.gif')!=-1){
								var value = LS._GetVar('BWE:P:'+name,{});
								if (_Exist(value['P'])){
									var lvl = GetLvl(value['P'])[0],
										olvl = DATAS._PlayerLevel(),
										cla = index=='pRank'?Number(DOM._GetFirstNodeTextContent(".//td[1]",0,oldTR)):null,
										oCla = _Exist(plDatas['C'])?plDatas['C']:null,
										checkNiv = (PREF._Get('AE','nMin')!=''?lvl>=Number(PREF._Get('AE','nMin')):true)&&(PREF._Get('AE','nMax')!=''?lvl<=Number(PREF._Get('AE','nMax')):true)&&(PREF._Get('AE','aMin')!=''?lvl>=(olvl-(olvl*Number(PREF._Get('AE','aMin'))/100)):true)&&(PREF._Get('AE','aMax')!=''?lvl<=(olvl+(olvl*Number(PREF._Get('AE','aMax'))/100)):true),
										checkCla = index=='pRank'&&cla!=0&&oCla!=null&&(PREF._Get('AE','cMin')!=''?cla>=Number(PREF._Get('AE','cMin')):true)&&(PREF._Get('AE','cMax')!=''?cla<=Number(PREF._Get('AE','cMax')):true)&&(PREF._Get('AE','acMin')!=''?cla>=(oCla-Number(PREF._Get('AE','acMin'))):true)&&(PREF._Get('AE','acMax')!=''?cla<=(oCla+Number(PREF._Get('AE','acMax'))):true);
									if (checkNiv&&(index!='pRank'||checkCla)) img.className = 'BWEblink';
									}
								}
							}
						}
					else if (col==62){
						var	check = DOM._GetFirstNode("./input",td);
						if (check!=null) IU._addEvent(newTD,'change',function(e,i){i.checked = e.target.checked;},check);
						}
					}
				else{ // colonne à créer
					newTD = IU._CreateElement('td',{'class':'BWELeft'},[],{},newTR);
					if ([1,17,18,19,21,22].indexOf(col)!=-1) newTD.className = 'BWEMiddle';
					if (col==0){
						var races = L._Get('sRaces');
						newTD.textContent = _Exist(value)&&_Exist(value['R'])&&_Exist(races[value['R']])?races[value['R']]:'-';
						}
					else if (col==1){
						newTD.textContent = _Exist(value)&&_Exist(value['S'])?value['S']:'-';
						newTD.className = 'BWELeft '+(_Exist(value)&&_Exist(value['S'])?value['S']==L._Get('sSexeH')?'BWEsexH':'BWEsexF':'');
						}
					else if (col==5){
						var result = DOM._GetFirstNodeTextContent(".//td["+(index=='pTownview'?4:8)+"]",null,oldTR);
						if (result!=null) newTD.textContent = GetLvl(result)[2];
						}
					else if (col==7){
						if (index=='pTownview'||index=='pRank'){
							var result = DOM._GetFirstNodeTextContent(".//td["+(index=='pTownview'?4:8)+"]",null,oldTR);
							if (!isNaN(result)&&parseInt(result)==Number(result)) newTD.textContent = L._Get('sNivFormat',GetLvl(result)[2],result);
							else newTD.textContent = '-';
						}
						else if (index=='pOAliance'||index=='pAliance'){
							var result = DOM._GetFirstNodeTextContent(".//td[5]",null,oldTR),
								result2 = DOM._GetFirstNodeTextContent(".//td[6]",null,oldTR);
							if (result!=null&&result2!=null) newTD.textContent = L._Get('sNivFormat',result,result2);
							}
						}
					if (col==17||col==18||col==19){
						var img = DOM._GetFirstNode("./td[2]/img["+(col==17?1:(col==18?2:3))+"]",oldTR);
						if (img!=null){
							newTD.className = "";
							newTD.appendChild(img.cloneNode(true));
							}
						}
					else if (col==21){
						var grp = LS._GetVar('BWE:G',{'A':[],'B':[]});
						IU._CreateElements({'checkA':['input',{'type':'checkbox','id':escape('BWEcheckA_'+name),
										'checked':(grp['A'].indexOf(name)>-1)},,{'change':[checkGrp,[name,'A']]},newTD],
									'checkB':['input',{'type':'checkbox','id':escape('BWEcheckB_'+name),
										'checked':(grp['B'].indexOf(name)>-1)},,{'change':[checkGrp,[name,'B']]},newTD]});
						}
					else if (col==22){
						newTD.textContent = _Exist(value)&&_Exist(value['S'])?value['S']:'-';
						newTD.className = 'BWEMiddle '+(_Exist(value)&&_Exist(value['S'])?value['S']==L._Get('sSexeH')?'BWEsexH':'BWEsexF':'');
						}
					else if (col==23){
						if (name==null) newTD.textContent = '-';
						else CreateHistory(ID,name,newTD);
						}
					else if (col==25){
						if (name==null) newTD.textContent = '-';
						else CreateHistory(name,ID,newTD);
						}
					}
				}
			}
		// tri du nouveau tableau
		if (tri!=null){
			if (tri[0]>newCol.length){
				tri = [1,1];
				PREF._Set(index,'tri',tri);
				}
			var selectCol = DOM._GetFirstNode("./td["+tri[0]+"]",newHead),
				newList = DOM._GetNodes("./tr",newBody);
			IU._CreateElement('span',{'class':'BWEtriSelect'},[(tri[1]==1?L._Get('sTriUp'):L._Get('sTriDown'))],{},selectCol);
			FctTriA(tri[0],tri[1],newBody,newList);
			}
		}
	}
// Divers
function FctTriA(key,order,tbody,list){
	// créé un tableau des éléments pour tri ultérieur
	var list2 = [];
	for (var i=0; i<list.snapshotLength; i++){
		var col = DOM._GetFirstNode(".//td["+key+"]",list.snapshotItem(i));
		if (col!=null){
			var isInput = DOM._GetFirstNode(".//input[1]", col),
				isInput2 = DOM._GetFirstNode(".//input[2]", col),
				isIMG = DOM._GetFirstNode(".//img", col),
				isA = DOM._GetFirstNode(".//a", col),
				value = col.textContent.trim().toLowerCase();// tri de base
			if (isInput!=null&&isInput2!=null){// tri pour les cases à cocher du Groupe
				value = (isInput.checked?"0":"1")+(isInput2.checked?"0":"1");
				}
			else if (isIMG==null&&isA==null){
				// colonne de type nombre : "xx","x.x","x."
				var result = new RegExp(L._Get('sTriNbTest')).exec(value);
				if (result!=null) value = parseFloat(result[1]);
				// colonne de type "yy (xx)", "yy-zz (xx)"
				var result = new RegExp(L._Get('sTriPtsTest')).exec(value);
				if (result!=null) value = parseInt(result[2]);
				// colonne de type "xx(yy%)"
				var result = new RegExp(L._Get('sTriPrcTest')).exec(value);
				if (result!=null) value = parseInt(result[1]);
				if (value=='∞') value = Number.POSITIVE_INFINITY;
				if (value=='-') value = '';
				}
			else if (isA!=null){
				var result = new RegExp("\\?a(=([^&$]+)|)(&|$)").exec(isA.href);
				if (result!=null){
					if (result[2]=='ambush') value = isIMG.src; // colonne embuscade
					else if (result[2]=='townview'){// colonne "adresse"
						result = new RegExp(L._Get('sTriAdrTest')).exec(isA.textContent);
						if (result!=null) value = parseInt(result[1])*100000+parseInt(result[2])*100+parseInt(result[3]);
						}
					else value = isA.textContent.toUpperCase();// colonne "Nom"
					}
				}
			else if (isIMG!=null){
				var result = new RegExp(L._Get('sTriOLTest')).exec(isIMG.alt);
				if (result!=null){// tri pour la colonne "En ligne"
					var j = _Exist(result[2])?parseInt(result[2]):0,
						h = _Exist(result[4])?parseInt(result[4]):0,
						m = _Exist(result[6])?parseInt(result[6]):0,
						s = _Exist(result[8])?parseInt(result[8]):0;
					value = j*24*60*60+h*60*60+m*60+s;
					}
				else{// tri pour k et expé
					var result = new RegExp(L._Get('sTriImgTest')).exec(isIMG.src);
					if (result!=null) value=(result[1]=='ok'?0:1);
					else value = isIMG.src;
					}
				}
			list2[i]=[value,i];
			}
		}
	// tri de la liste suivant la colonne sélectionnée
	list2.sort(function(a,b){return a[0]<b[0]?-1:a[0]==b[0]?0:1;});
	if (order==0) list2.reverse();
	// mise en forme
	tbody.innerHTML = "";
	for(var i=0; i<list2.length; i++){
		var ligne = list.snapshotItem(list2[i][1]);
		ligne.setAttribute('class',(i%2==0)?'':'even');
		ligne.setAttribute('onmouseout',(i%2==0)?"this.className='';":"this.className='even';");
		tbody.appendChild(ligne);
		}
	}
// Pages 'pOAliance','pAliance'
function show_hide(e,i){
	var show = PREF._Get(page,i[2])==1?0:1;
	PREF._Set(page,i[2],show);
	i[0].setAttribute('style','display:'+(show==1?'block;':'none;'));
	i[1].setAttribute('style','color:'+(show==1?'lime;':'red;')+';cursor: pointer;');
	}
// pages 'pRootSettings','pSettingsAi','pSettingsAcc','pSettingsVac','pSettingsDelchar'
function setMenuOptions(e){
	function check(e,i){ // i[0] = ensemble ,i[1] = key
		PREF._Set(i[0],i[1],e.target.checked?1:0);
		}
	function inputNumber(e,i){ // i[0] = ensemble ,i[1] = key
		var value = e.target.value,
			result = new RegExp("^(|(?:[0-9]+|[0-9]*[.]?[0-9]+))$").exec(value);
		if (result!=null){
			e.target.setAttribute('class','BWEAEBut');
			PREF._Set(i[0],i[1],value);
			}
		else e.target.setAttribute('class','BWEAEButError');
		}
	function changeCol(e,i){// i[0]= liste, i[1]= ligne, i[2]= ligne + ou -
		var col = PREF._Get(i[0],'list'),
			cell1 = DOM._GetFirstNode("//td[@id='BWE_"+i[0]+'_'+i[1]+"']"),
			cell2 = DOM._GetFirstNode("//td[@id='BWE_"+i[0]+'_'+i[2]+"']"),
			temp = col[i[1]];
		col[i[1]] = col[i[2]];
		col[i[2]] = temp;
		cell1.setAttribute('style','text-decoration:'+(col[i[1]][1]==1?'none':'line-through'));
		cell2.setAttribute('style','text-decoration:'+(col[i[2]][1]==1?'none':'line-through'));
		cell1.textContent = L._Get('sColTitle')[col[i[1]][0]];
		cell2.textContent = L._Get('sColTitle')[col[i[2]][0]];
		PREF._Set(i[0],'list',col);
		}
	function clickCol(e,i){// i[0]= liste, i[1]= ligne
		var col = PREF._Get(i[0],'list');
		col[i[1]][1] = col[i[1]][1]==1?0:1;
		e.target.setAttribute('style','text-decoration:'+(col[i[1]][1]==1?'none':'line-through'));
		PREF._Set(i[0],'list',col);
		}
	function razPrefs(e){
		PREF._Raz();
		setMenuOptions();
		}
	function createColList(){
		var liste = nodeMenu['select1'].options[nodeMenu['select1'].selectedIndex].value,
			col = PREF._Get(liste,'list');
		nodeMenu['tbody1'].innerHTML = "";
		if (PREF._Get(liste,'sh')!=null){
			IU._CreateElements({'tr':['tr',,,,nodeMenu['tbody1']],
			'td1':['td',,[],,'tr'],
			'td2':['td',,[],,'tr'],
			'label':['label',{'for':'BWElabel'},[L._Get("sActive")],,'td2'],
			'td3':['td',,[],,'tr'],
			'check':['input',{'type':'checkbox','id':'BWElabel','checked':PREF._Get(liste,'sh')==1},,{'change':[check,[liste,'sh']]},'td3']});
			}
		for (var j=0;j<col.length;j++){
			var cellIU = {'tr':['tr',{'class':(j%2==1?'even':''),'onmouseout':"this.className="+(j%2==1?"'even';":"'';"),'onmouseover':"this.className='selectedItem';"},,,nodeMenu['tbody1']],
				'td1':['td',{'class':'BWEPrefTD1'},[j],,'tr'],
				'td2':['td',{'class':'BWEPrefTD2','id':('BWE_'+liste+'_'+j),'style':'text-decoration:'+(col[j][1]==1?'none':'line-through')},[L._Get('sColTitle')[col[j][0]]],{'click':[clickCol,[liste,j]]},'tr'],
				'td3':['td',{'class':'BWEPrefTD3'},,,'tr']},
				cell = IU._CreateElements(cellIU);
			if (j!=0) IU._CreateElement('a',{},[L._Get('sTriUp')],{'click':[changeCol,[liste,j,(j-1)]]},cell['td3']);
			if (j<col.length-1) IU._CreateElement('a',{},[L._Get('sTriDown')],{'click':[changeCol,[liste,j,(j+1)]]},cell['td3']);
			}
		}
	function createList(list,node){
		var newNode = node;
		for (var j=0;j<list.length;j++){
			if (_Type(list[j][1])=='Array'){
				newNode = IU._CreateElement('optgroup',{'label':L._Get("sTitresList")[list[j][0]]},[],{},node);
				createList(list[j][1],newNode);
				}
			else IU._CreateElement('option',{'value':list[j][1]},[L._Get("sTitresList")[list[j][0]]],{},newNode);
			}
		}
	var result = DOM._GetNodes(".//a", nodeOptions);
	for (var i=0; i<result.snapshotLength; i++) result.snapshotItem(i).className = '';
	nodeTitle['2'].className = 'active';
	var content = DOM._GetFirstNode("./following-sibling::div[@class='hr720']/following-sibling::*",nodeOptions),
		content2 = DOM._GetFirstNode("./following-sibling::div[@class='hr720']/following-sibling::script",nodeOptions);
	if (content!=null){
		var menuIU = {
			'menudiv':['div',{'align':'center','style':'margin-top: 15px;'}],
			'div1':['div',,['BWE : '],,'menudiv'],
			'a1':['a',{'href':'https://github.com/Ecilam/BloodWarsEnhanced','TARGET':'_blank'},[((typeof(GM_info)=='object')?GM_info.script.version:'?')],,'div1'],
			'br2':['br',,,,'menudiv'],
			'table0':['table',{'style':'width:100%;','class':'BWEMenu'},,,'menudiv'],
			'tr0_0':['tr',,,,'table0'],
			'td0_0_0':['td',{'style':'vertical-align:top;'},,,'tr0_0'],
			'table1':['table',{'style':'width:80%;','class':'BWEMenu'},,,'td0_0_0'],
			'thead1':['thead',,,,'table1'],
			'tr1_0':['tr',{'class':'tblheader'},,,'thead1'],
			'td1_0_0':['td',{'class':'BWELeft','colspan':'3'},,,'tr1_0'],
			'help1':['img',{'class':'BWEHelp','src':'/gfx/hint2.png','onmouseout':'nd();','onmouseover':"return overlib('"+L._Get("sInfoMsg")+"',HAUTO,WRAP);"},,,'td1_0_0'],
			'texte1':['span',{'class':'BWELeft'},[L._Get("sTitleList")],,'td1_0_0'],
			'select1':['select',{'class':'combobox','id':'liste'},,{'change':[createColList]},'td1_0_0'],
			'tbody1':['tbody',,,,'table1'],
			'td0_0_1':['td',{'style':'vertical-align:top;'},,,'tr0_0'],
			'table2':['table',{'style':'width:80%;','class':'BWEMenu'},,,'td0_0_1'],
			'thead2':['thead',,,,'table2'],
			'tr2_0':['tr',{'class':'tblheader'},,,'thead2'],
			'td2_0_0':['td',{'class':'BWELeft','colspan':'3'},[L._Get("sTitleDivers")],,'tr2_0'],
			'tbody2':['tbody',,,,'table2'],
			'br3':['br',,,,'menudiv'],
			'reset':['input',{'class':'button','type':'button','value':L._Get("sDefaut")},,{'click':[razPrefs]},'menudiv']
			},
			nodeMenu = IU._CreateElements(menuIU),
			// n°titre du groupe ou Array:[n°titre(cf sTitresList),nom de la liste]
			menuList = [[0,[[1,'pOProfile'],[2,'pProfile'],[3,'pTownview'],[4,'pOAliance'],[5,'pAliance'],[6,'pAlianceList'],[7,'pRank']]],
					[8,[[9,'pMsgList'],[10,'pMsgSaveList'],[11,'pMsgSendList']]],
					[12,[[13,'hlog'],[14,'hdiv'],[15,'hch'],[16,'hres']]]],
			// Array:[type,n°titre,array:['ensemble','key']] 
			menuDiv = [["check",0,['pMsgFriendList','sh']],["check",1,['div','chSt']],["inputN",2,['div','nbLo']],["check",3,['div','chLo']],["check",4,['AE','sh']],
					["",5],["inputN",7,['AE','nMin']],["inputN",8,['AE','nMax']],["inputN",9,['AE','aMin']],["inputN",10,['AE','aMax']],
					["",6],["inputN",7,['AE','cMin']],["inputN",8,['AE','cMax']],["inputN",9,['AE','acMin']],["inputN",10,['AE','acMax']]];
		// Partie Liste
		createList(menuList,nodeMenu['select1']);
		createColList();
		// Partie Divers
		for (var j=0;j<menuDiv.length;j++){
			var cellIU = {'tr':['tr',{'class':(j%2==1?'even':'')},,,nodeMenu['tbody2']],
				'td1':['td',{'class':'BWELeft'},,,'tr'],
				'td2':['td',{'class':'BWERight'},,,'tr']},
				cell = IU._CreateElements(cellIU);
			cell['td1'].textContent = L._Get("sTitresDiv")[menuDiv[j][1]];
			if (menuDiv[j][0]=="check") IU._CreateElement('input',{'type':'checkbox','checked':PREF._Get(menuDiv[j][2][0],menuDiv[j][2][1])==1},[],{'change':[check,[menuDiv[j][2][0],menuDiv[j][2][1]]]},cell['td2']);
			else if (menuDiv[j][0]=="inputN") IU._CreateElement('input',{'type':'text','class':'BWEAEBut','value':PREF._Get(menuDiv[j][2][0],menuDiv[j][2][1]),'size':'5','maxlength':'5'},[],{'change':[inputNumber,[menuDiv[j][2][0],menuDiv[j][2][1]]],'keyup':[inputNumber,[menuDiv[j][2][0],menuDiv[j][2][1]]]},cell['td2']);
			}
		if (content != content2) content.parentNode.replaceChild(nodeMenu['menudiv'],content);
		else content.parentNode.insertBefore(nodeMenu['menudiv'],content);
		}
	}
// pages 'pRootSettings','pSettingsAi','pSettingsAcc','pSettingsVac','pSettingsDelchar'
function setMenuDB(e){
	function selectLSChange(e){
		if (nodeMenu['selectLS'].selectedIndex>=0)
			nodeMenu['divLS'].textContent = JSONS._Encode(LS._GetVar(unescape(nodeMenu['selectLS'].options[nodeMenu['selectLS'].selectedIndex].value),""));
		}
	function delLS(e){
		if (nodeMenu['selectLS'].selectedIndex>=0){
			var index = nodeMenu['selectLS'].selectedIndex,
				key = unescape(nodeMenu['selectLS'].options[index].value);
			LS._Delete(key);
			result.splice(index,1);
			LSList.splice(LSList.indexOf(key),1);
			nodeMenu['selectLS'].remove(index);
			nodeMenu['divLS'].textContent = "";
			nodeMenu['td1_2_0'].textContent = L._Get('sResult',result.length,LSList.length);
			nodeMenu['divIE'].textContent = '';
			}
		}
	function razLS(e){
		if (confirm(L._Get("sRazChkLS"))){
			nodeMenu['divLS'].textContent = "";
			nodeMenu['td1_2_0'].textContent = L._Get('sResult',0,0);
			LSList = [],
			result = [];
			while (nodeMenu['selectLS'].length>0) nodeMenu['selectLS'].remove(0);
			for (var i=LS._Length()-1;i>=0;i--) if(LS._Key(i).indexOf('BWE:')==0) LS._Delete(LS._Key(i));
			nodeMenu['divIE'].textContent = '';
			PREF._Raz();
			}
		}
	function triLSList(e){
		while (nodeMenu['selectLS'].length>0) nodeMenu['selectLS'].remove(0);
		nodeMenu['divLS'].textContent = "";
		result = [];
		for (var i=0;i<LSList.length;i++)
			if(LSList[i].toLowerCase().indexOf(nodeMenu['LSsearch'].value.toLowerCase())!=-1) result.push(i);
		result.sort(function(a,b){
			var x = LSList[a].toLowerCase(),
				y = LSList[b].toLowerCase();
			return x<y?-1:x==y?0:1;
			});
		nodeMenu['td1_2_0'].textContent = L._Get('sResult',result.length,LSList.length);
		for (var i=0;i<result.length;i++)IU._CreateElement('option',{'value':escape(LSList[result[i]])},[LSList[result[i]]],{},nodeMenu['selectLS']);
		nodeMenu['selectLS'].selectedIndex = 0;
		selectLSChange();
		}
	function outputLog(){
		var output = '';
		for (var i=0;i<LS._Length();i++){
			var key = LS._Key(i),
				result = new RegExp('^BWE:L:('+ID+'(:(?!'+ID+'$)(.+$))|(((?!'+ID+':)(.+:))'+ID+'$))').exec(key);
			if (result!=null) output += key+'='+JSONS._Encode(LS._GetVar(key,[]));
			}
		nodeMenu['divIE'].textContent = escape(output);
		}
	function importLog(e){
		var input = unescape(nodeMenu['textIE'].value),
			x = 0,i,reg = new RegExp('BWE:L:('+ID+'(?!:'+ID+'=)|(?!'+ID+':)[^:=]+(?=:'+ID+'=)):([^:=]+)=(\\[.*?\\])(?=BWE|$)','g');
		while ((i=reg.exec(input))!=null){
			var att = i[1],def = i[2],log = i[3],
				result = JSONS._Decode(log);
			for (var j=0;j<result.length;j++){
				UpdateHistory(att,def,result[j][0],new Date(result[j][1]),result[j][2]);
				if (LS._GetVar('BWE:L:'+att+':'+def,null)!=null&&LSList.indexOf('BWE:L:'+att+':'+def)==-1) LSList.push('BWE:L:'+att+':'+def);
				x++;
				nodeMenu['td3_2_1'].textContent = L._Get('sIEResult',x);
				}
			}
		nodeMenu['divIE'].textContent = '';
		triLSList();
		}
	var result = DOM._GetNodes(".//a", nodeOptions);
	for (var i=0; i<result.snapshotLength; i++) result.snapshotItem(i).className = '';
	nodeTitle['4'].className = 'active';
	var content = DOM._GetFirstNode("./following-sibling::div[@class='hr720']/following-sibling::*",nodeOptions),
		content2 = DOM._GetFirstNode("./following-sibling::div[@class='hr720']/following-sibling::script",nodeOptions);
	if (content!=null){
		var menuIU = {
			'menudiv':['div',{'align':'center','style':'margin-top: 15px;'}],
			'divalert':['div',{'class':'auBid','style':'border: 1px solid red; padding: 3px; margin: 3px;'},,,'menudiv'],
			'table':['table',{'style':'width: 100%;'},,,'divalert'],
			'tr_0':['tr',,,,'table'],
			'td_0_0':['td',{'align':'center','width':'30'},,,'tr_0'],
			'img_0_0':['img',{'src':'./gfx/infobox_fail.gif'},,,'td_0_0'],
			'td_0_1':['td',{'class':'error'},[L._Get('sAlertMsg')],,'tr_0'],
			'BR0':['br',,,,'menudiv'],
			'table0':['table',{'style':'width: 100%;','cellspacing':'0','cellpadding':'0'},,,'menudiv'],
			'tr0_0':['tr',{'class':'tblheader'},,,'table0'],
			'td0_0_0':['td',{'class':'BWELeft'},[L._Get('sTitleLS')],,'tr0_0'],
			'tr0_1':['tr',,,,'table0'],
			'td0_1_0':['td',,,,'tr0_1'],
			'table1':['table',{'style':'padding:5px;width: 100%;'},,,'td0_1_0'],
			'tr1_0':['tr',,,,'table1'],
			'td1_0_0':['td',{'colspan':'4'},,,'tr1_0'],
			'LLSSearch':['label',{'class':'BWELeft','for':'LSsearch'},[L._Get('sLabelSearch')],,'td1_0_0'],
			'tr1_1':['tr',,,,'table1'],
			'td1_1_0':['td',,,,'tr1_1'],
			'LSsearch':['input',{'class':'inputbox','type':'text'},,{'change':[triLSList],'keyup':[triLSList]},'td1_1_0'],
			'td1_1_1':['td',,,,'tr1_1'],
			'td1_1_2':['td',{'class':'BWELeft'},,,'tr1_1'],
			'delLS':['input',{'class':'button','type':'button','value':L._Get("sDelete")},,{'click':[delLS]},'td1_1_2'],
			'td1_1_3':['td',{'class':'BWERight'},,,'tr1_1'],
			'razLS':['input',{'class':'button','type':'button','value':L._Get("sRAZ")},,{'click':[razLS]},'td1_1_3'],
			'tr1_2':['tr',,,,'table1'],
			'td1_2_0':['td',{'colspan':'4'},,,'tr1_2'],
			'tr1_3':['tr',,,,'table1'],
			'td1_3_0':['td',{'colspan':'2','valign':'top','style':'width:220px;'},,,'tr1_3'],
			'selectLS':['select',{'class':'inputbox select BWEselectLS','size':'20','style':'width:200px;'},,{'change':[selectLSChange]},'td1_3_0'],
			'td1_3_1':['td',{'colspan':'2','valign':'top','style':'width:490px;'},,,'tr1_3'],
			'divLS':['div',{'class':'inputbox BWEdivLS','style':'width:490px;'},,,'td1_3_1'],
			'BR1':['br',,,,'menudiv'],
			'table2':['table',{'style':'width: 100%;','cellspacing':'0','cellpadding':'0'},,,'menudiv'],
			'tr2_0':['tr',{'class':'tblheader'},,,'table2'],
			'td2_0_0':['td',{'class':'BWELeft'},[L._Get('sTitleIE')],,'tr2_0'],
			'tr2_1':['tr',,,,'table2'],
			'td2_1_0':['td',,,,'tr2_1'],
			'table3':['table',{'style':'padding:5px;width: 100%;'},,,'td2_1_0'],
			'tr3_0':['tr',,,,'table3'],
			'td3_0_0':['td',{'class':'BWELeft'},[L._Get('sExportText')],,'tr3_0'],
			'ExportHelp':['img',{'class':'BWEHelp','src':'/gfx/hint2.png','onmouseout':'nd();','onmouseover':"return overlib('"+L._Get("sExportHelp")+"',HAUTO,WRAP);"},,,'td3_0_0'],
			'td3_0_1':['td',{'class':'BWERight'},,,'tr3_0'],
			'export':['input',{'class':'button','type':'button','value':L._Get("sOutputLog")},,{'click':[outputLog]},'td3_0_1'],
			'td3_0_2':['td',,,,'tr3_0'],
			'td3_0_3':['td',{'class':'BWELeft'},[L._Get('sImportText')],,'tr3_0'],
			'ImportHelp':['img',{'class':'BWEHelp','src':'/gfx/hint2.png','onmouseout':'nd();','onmouseover':"return overlib('"+L._Get("sImportHelp")+"',HAUTO,WRAP);"},,,'td3_0_3'],
			'td3_0_4':['td',{'class':'BWERight'},,,'tr3_0'],
			'import':['input',{'class':'button','type':'button','value':L._Get("sImportLog")},,{'click':[importLog]},'td3_0_4'],
			'tr3_1':['tr',,,,'table3'],
			'td3_1_0':['td',{'colspan':'2','valign':'top','style':'width:345px;'},,,'tr3_1'],
			'divIE':['div',{'class':'inputbox BWEdivIE','style':'width:345px;'},,,'td3_1_0'],
			'td3_1_1':['td',{'style':'width:20px;'},,,'tr3_1'],
			'td3_1_2':['td',{'colspan':'2','valign':'top','style':'width:345px;'},,,'tr3_1'],
			'textIE':['textarea',{'class':'textarea BWEdivIE','style':'width:345px;'},,,'td3_1_2'],
			'tr3_2':['tr',,,,'table3'],
			'td3_2_0':['td',{'colspan':'2'},,,'tr3_2'],
			'td3_2_1':['td',{'colspan':'2'},,,'tr3_2']
			},
			nodeMenu = IU._CreateElements(menuIU);
		if (content != content2) content.parentNode.replaceChild(nodeMenu['menudiv'],content);
		else content.parentNode.insertBefore(nodeMenu['menudiv'],content);
		// LS
		var LSList = [],
			result = [];
		for (var i=0;i<LS._Length();i++){
			var key = LS._Key(i);
			LSList.push(key); //if(key.indexOf('BWE:')==0)
			}
		triLSList();
		}
	}

/******************************************************
* START
*
******************************************************/
// vérification des services
if (!JSON) throw new Error("Erreur : le service JSON n\'est pas disponible.");
else if (!window.localStorage) throw new Error("Erreur : le service localStorage n\'est pas disponible.");
else{
	var page = DATAS._GetPage(),
		player = DATAS._PlayerName(),
		IDs = LS._GetVar('BWE:IDS',{});
console.debug('BWEpage :',page);
	// Pages gérées par le script
	if (['null','pServerDeco','pServerUpdate','pServerOther'].indexOf(page)==-1&&player!=null){
console.debug('BWEstart: %o %o',player,IDs);
		if (page=='pMain'){
			var result = DOM._GetFirstNodeTextContent("//div[@class='throne-maindiv']/div/span[@class='reflink']",null);
			if (result!=null){
				var result2 = /r\.php\?r=([0-9]+)/.exec(result),
					ID = _Exist(result2[1])?result2[1]:null;
				if (ID!=null){
					for (var i in IDs) if (IDs[i]==ID) delete IDs[i]; // en cas de changement de nom
					IDs[player] = ID;
					LS._SetVar('BWE:IDS',IDs);
					}
				}
			}
		// Autre pages nécessitant l'ID
		else if (_Exist(IDs[player])){
			var ID = IDs[player];
			PREF._Init(ID);
			SetCSS();
			//Update player datas
			var plDatas = LS._GetVar('BWE:P:'+player,{});
			plDatas['N'] = DATAS._PlayerLevel();
			plDatas['P'] = Number(DATAS._PlayerPdP());
			LS._SetVar('BWE:P:'+player,plDatas);
			if  ((page=='pOProfile'||page=='pProfile')&&PREF._Get(page,'sh')==1){
				var name = new RegExp(L._Get('sNameTest')).exec(DOM._GetFirstNodeTextContent("//div[@id='content-mid']/div[@class='profile-hdr']",null)),
					ttable = DOM._GetFirstNode("//div[@id='content-mid']/div[@style='float: left; width: 49%;']/fieldset[1]/table"),
					trList = DOM._GetNodes("./tbody/tr",ttable);
				if (name!=null&&ttable!=null&&trList!=null&&trList.snapshotLength==14){
					// récupère les données
					var value = LS._GetVar('BWE:P:'+name[1],{}),
						uid = /.*\?a=profile&uid=(\d*)$/.exec(DOM._GetFirstNodeTextContent("//div[@id='content-mid']/div/a[@target='_blank']",null)),
						race = DOM._GetFirstNodeTextContent("./td[2]",null,trList.snapshotItem(0)),
						sexe = DOM._GetFirstNodeTextContent("./td[2]",null,trList.snapshotItem(1)),
						niv = DOM._GetFirstNodeTextContent("./td[2]",null,trList.snapshotItem(5)),
						pts = DOM._GetFirstNodeTextContent("./td[2]",null,trList.snapshotItem(6));
					if (uid!=null) value['U'] = uid[1];
					if (race!=null) value['R'] = L._Get('sRaces').indexOf(race);
					if (sexe!=null) value['S'] = sexe==L._Get("sSexeHomme")?L._Get("sSexeH"):L._Get("sSexeF");
					if (niv!=null) value['N'] = niv;
					if (pts!=null) value['P'] = Number(pts);
					LS._SetVar('BWE:P:'+name[1],value);
					// nouveau tableau
					var newTableIU = {
						'table':['table',{'id':'BWE'+page+'table','style':'margin: 10px;','cellspacing':'0'}],
						'tbody':['tbody',{'id':'BWE'+page+'body'},,,'table']},
						newTable = IU._CreateElements(newTableIU);
					ttable.parentNode.insertBefore(newTable['table'],ttable.nextSibling);
					// garde uniquement les lignes sélectionnées
					var newLig = PREF._Get(page,'list');
					for (var j=0;j<newLig.length;j++){
						if (newLig[j][1]==1){
							// ligne existante
							if (newLig[j][2]!=-1) newTR = newTable['tbody'].appendChild(trList.snapshotItem(newLig[j][2]).cloneNode(true));
							else{ // ligne à créer
								var trIU = {'tr':['tr',,,,newTable['tbody']],
											'td1':['td',,,,'tr'],'b':['b',,[L._Get("sColTitle")[newLig[j][0]]],,'td1'],
											'td2':['td',,,,'tr']},
									newTR = IU._CreateElements(trIU),
									line = newLig[j][0];
								if (line==7) newTR['td2'].textContent = L._Get('sNivFormat',niv,pts);
								else if (line==8){
									var show = PREF._Get('grp','sh')==1,
										grp = LS._GetVar('BWE:G',{'A':[],'B':[]}),
										grpIU = {'tr0':['tr',{'style':'display:'+(show?'table-row;':'none;')},,,newTable['tbody']],
												'td00':['td',{'id':'BWEgrpA','colspan':'2'},,,'tr0'],
												'tr1':['tr',{'style':'display:'+(show?'table-row;':'none;')},,,newTable['tbody']],
												'td10':['td',{'id':'BWEgrpB','colspan':'2'},,,'tr1']},
										grpTR = IU._CreateElements(grpIU);
									newTR['td1'].setAttribute('style','color:'+(show?'lime;':'red;')+';cursor: pointer;');
									IU._addEvent(newTR['td1'],'click',showHideGr,[newTR['td1'],grpTR['tr0'],grpTR['tr1']]);
									var grTDIU = {'labelA':['label',{'for':escape('BWEcheckA_'+name[1])},['A'],,newTR['td2']],
												'checkA':['input',{'type':'checkbox','id':escape('BWEcheckA_'+name[1]),
													'checked':(grp['A'].indexOf(name[1])>-1)},,
													{'change':[checkGrp,[name[1],'A']]},newTR['td2']],
												'labelB':['label',{'for':escape('BWEcheckB_'+name[1])},['B'],,newTR['td2']],
												'checkB':['input',{'type':'checkbox','id':escape('BWEcheckB_'+name[1]),
													'checked':(grp['B'].indexOf(name[1])>-1)},,
													{'change':[checkGrp,[name[1],'B']]},newTR['td2']]},
										grTD = IU._CreateElements(grTDIU);
									createGrpTable('A');
									createGrpTable('B');
									}
								else if (line==14){
									var trIU = {'table':['table',{'style':'width:90%;'},,,newTR['td2']],
												'tr10':['tr',,,,'table'],
													'td11':['td',,[L._Get('sProfAtt')],,'tr10'],
													'td12':['td',{'class':'BWEMiddle','style':'min-width:4em;'},,,'tr10'],
													'td13':['td',,[L._Get('sProfDef')],,'tr10'],
													'td14':['td',{'class':'BWEMiddle','style':'min-width:4em;'},,,'tr10']},
										embTR = IU._CreateElements(trIU);
									CreateHistory(ID,name[1],embTR['td12']);
									CreateHistory(name[1],ID,embTR['td14']);
									}
								}
							}
						}
					ttable.setAttribute('style','display:none');
					}
				}
			else if (page=='pTownview'&&PREF._Get(page,'sh')==1){
				var target = DOM._GetFirstNode("//div[@id='content-mid']//div[@id='tw_table']"),
					theader = DOM._GetFirstNode(".//tr[@class='tblheader']",target),
					ttable = DOM._GetFirstNode("./ancestor::table[last()]",theader);
				if (target!=null&&theader!=null&&ttable!=null){
					// recréé le tableau en cas de changement
					var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
						observer = new MutationObserver(function(mutations){
							var theader = DOM._GetFirstNode("//div[@id='content-mid']//div[@id='tw_table']//tr[@class='tblheader']"),
								ttable = DOM._GetFirstNode("./ancestor::table[last()]",theader),
								tlist = DOM._GetNodes("./following-sibling::tr",theader);
							if (ttable!=null&&tlist!=null){
								observer.disconnect();
								var oldTable = DOM._GetFirstNode("//div[@id='BWE"+page+"div']");
								if (oldTable!=null) oldTable.parentNode.removeChild(oldTable);
								var newTableIU = {
									'div':['div',{'id':'BWE'+page+'div','align':'center'},],
									'table':['table',{'id':'BWE'+page+'table','style':'width:95%;'},,,'div'],
									'thead':['thead',,,,'table'],
									'tr':['tr',{'id':'BWE'+page+'header','class':'tblheader'},,,'thead'],
									'tbody':['tbody',{'id':'BWE'+page+'body'},,,'table']},
									newTable = IU._CreateElements(newTableIU);
								target.parentNode.insertBefore(newTable['div'],target.nextSibling);
								CreateTable(theader,tlist,page);
								ttable.setAttribute('style','display:none');
								observer.observe(target,{childList: true});
								}
							});
					observer.observe(target,{childList:true,attributes:true,subtree:true});
					ttable.setAttribute('style','display:none'); // provoque observer
					}
				}
			else if (page=='pOAliance'||page=='pAliance'){
				// options pour afficher/masquer
				var td = DOM._GetNodes("//div[@id='content-mid']//div[@class='clan-desc']");
				if (td!=null){
					if (_Exist(td.snapshotItem(0))){
						var td1prev = DOM._GetFirstNode(".//parent::td/preceding-sibling::td/b",td.snapshotItem(0));
						if (td1prev!=null){
							var show = PREF._Get(page,'sh1')==1;
							td.snapshotItem(0).setAttribute('style','display:'+(show?'block;':'none;'));
							td1prev.setAttribute('style','color:'+(show?'lime;':'red;')+';cursor: pointer;');
							IU._addEvent(td1prev,'click',show_hide,[td.snapshotItem(0),td1prev,'sh1']);
							}
						}
					if (_Exist(td.snapshotItem(1))){
						var td2prev = DOM._GetFirstNode("//div[@id='content-mid']//td[@style='padding-top: 10px; padding-bottom: 4px; vertical-align: top;']/b");
						if (td2prev!=null){
							var show = PREF._Get(page,'sh2')==1;
							td.snapshotItem(1).setAttribute('style','display:'+(show?'block;':'none;'));
							td2prev.setAttribute('style','color:'+(show?'lime;':'red;')+';cursor: pointer;');
							IU._addEvent(td2prev,'click',show_hide,[td.snapshotItem(1),td2prev,'sh2']);
							}
						}
					}
				// liste des vampires
				if (PREF._Get(page,'sh')==1){
					var ttable = DOM._GetFirstNode("//div[@id='content-mid']//table[@class='sortable']"),
						theader = DOM._GetFirstNode("./thead/tr[@class='tblheader']",ttable),
						tlist = DOM._GetNodes("./tbody/tr",ttable);
					if (ttable!=null&&theader!=null&&tlist!=null){
						var newTableIU = {
							'div':['div',{'id':'BWE'+page+'div','align':'center'},],
							'table':['table',{'id':'BWE'+page+'table','style':'width:95%;'},,,'div'],
							'thead':['thead',,,,'table'],
							'tr':['tr',{'id':'BWE'+page+'header','class':'tblheader'},,,'thead'],
							'tbody':['tbody',{'id':'BWE'+page+'body'},,,'table']},
							newTable = IU._CreateElements(newTableIU);
						ttable.parentNode.insertBefore(newTable['div'],ttable.nextSibling);
						CreateTable(theader,tlist,page);
						ttable.setAttribute('style','display:none');
						if (DOM._GetFirstNode("//td[@id='BWEgrpcol']")!=null){
							var newGrpIU = {
								'tableGrp':['table',{'id':'BWEGrp','style':'width:95%;'},,,newTable['div']],
								'tr0':['tr',,,,'tableGrp'],
								'td00':['td',{'id':'BWEgrpA','class':'BWEMiddle','style':'width:45%;','valign':'top'},,,'tr0'],
								'td01':['td',{'id':'BWEgrpB','class':'BWEMiddle','style':'width:45%;','valign':'top'},,,'tr0']},
								newGrp = IU._CreateElements(newGrpIU);
							createGrpTable('A');
							createGrpTable('B');
							}
						}
					}
				}
			else if (page=='pAlianceList'&&PREF._Get(page,'sh')==1){
				var theader = DOM._GetFirstNode("//div[@id='content-mid']//tr[@class='tblheader']"),
					ttable = DOM._GetFirstNode("./ancestor::table[last()]",theader),
					tlist = DOM._GetNodes("./following-sibling::tr",theader);
				if (ttable!=null&&theader!=null&&tlist!=null){
					var newTableIU = {
						'div':['div',{'id':'BWE'+page+'div','align':'center'},],
						'table':['table',{'id':'BWE'+page+'table','style':'width:100%;'},,,'div'],
						'thead':['thead',,,,'table'],
						'tr':['tr',{'id':'BWE'+page+'header','class':'tblheader'},,,'thead'],
						'tbody':['tbody',{'id':'BWE'+page+'body'},,,'table']},
						newTable = IU._CreateElements(newTableIU);
					ttable.parentNode.insertBefore(newTable['div'],ttable.nextSibling);
					CreateTable(theader,tlist,page);
					ttable.setAttribute('style','display:none');
					}
				}
			else if ((page=='pMkstone'||page=='pUpgitem'||page=='pMixitem'||page=='pDestitem'||page=='pTatoo')&&PREF._Get('div','chSt')==1){
				var cost = new Array(['disp_stone_blood',1],['disp_stone_heart',10],['disp_stone_life',50],['disp_stone_change',150],['disp_stone_soul',500]),
					sum = 0;
				for (var i=0;i<cost.length;i++){
					var result = DOM._GetFirstNodeTextContent("//div[@id='content-mid']//span[@id='"+cost[i][0]+"']",null);
					if (result!=null) sum = sum + (cost[i][1]*parseInt(result));
					}
				var result = DOM._GetFirstNode("//div[@id='content-mid']//fieldset[@class='profile mixer']");
				if (result!=null){
					var totalIU = {'div1':['div',{'align':'center'}],
									'div2':['div',{'style':'padding:2px;'},[L._Get("sTotal")],,'div1'],
									'b':['b',,[sum],,'div2']},
						total = IU._CreateElements(totalIU);
					result.parentNode.insertBefore(total['div1'],result.nextSibling);
					}
				}
			else if (page=='pAmbushRoot'&&PREF._Get('div','chLo')==1){
				var atkaction = DOM._GetFirstNode("//div[@id='content-mid']//tr[@class='tblheader']/td/a[@class='clanOwner']");
				if (atkaction!=null){
					var ambushScript = DOM._GetFirstNodeInnerHTML("//div[@id='content-mid']/script",null);
					if (ambushScript!=null){
						var result = new RegExp(L._Get('sAtkTime')).exec(ambushScript);
						if (result!=null){
							var msgDate = DATAS._Time(),
								result2 = new RegExp(L._Get('sMidMsg')).exec(ambushScript),
								playerVS = DOM._GetFirstNodeTextContent("//div[@id='content-mid']//tr[@class='tblheader']/td/a[@class='players']",null);
							if (msgDate!=null&&result2!=null&&playerVS!=null){
								msgDate.setTime(msgDate.getTime()+result[1]*1000);
								UpdateHistory(ID,playerVS,result2[1],msgDate,null);
								}
							}
						}
					}
				}
			else if (page=='pMsgList'||page=='pMsgSaveList'||page=='pMsgSendList'){
				var theader = DOM._GetFirstNode("//div[@id='content-mid']//tr[@class='tblheader']"),
					ttable = DOM._GetFirstNode("./ancestor::table[last()]",theader),
					tlist = DOM._GetNodes("./following-sibling::tr",theader);
				if (tlist!=null&&PREF._Get('div','chLo')==1){
					for (var i=0;i<tlist.snapshotLength;i++){
						var node = tlist.snapshotItem(i),
							msg = DOM._GetFirstNodeTextContent(".//td[2]/a[@class='msg-link']",null,node),
							msgDate = DOM._GetFirstNodeTextContent(".//td[4]",null,node),
							msgId = DOM._GetFirstNode(".//td[1]/input",node);
						// conversion au format Date
						var value = new RegExp("([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})").exec(msgDate);
						msgDate = (value!=null)?new Date(value[1],value[2]-1,value[3],value[4],value[5],value[6]):null;
						if (msg!=null&&msgDate!=null&&msgId!=null){
							var msgId = msgId.getAttribute('id').replace('msgid_', ''),
								m1 = new RegExp(L._Get('sAmbushMsg1')).exec(msg),
								m2 = new RegExp(L._Get('sAmbushMsg2')).exec(msg);
							// messages d'embuscade ?
							if (m1!=null) UpdateHistory(m1[1],ID,msgId,msgDate,null);
							else if (m2!=null) UpdateHistory(ID,m2[1],msgId,msgDate,null);
							}
						}
					}
				if (ttable!=null&&theader!=null&&tlist!=null&&PREF._Get(page,'sh')==1){
					var newTableIU = {
						'div':['div',{'id':'BWE'+page+'div','align':'center'},],
						'table':['table',{'id':'BWE'+page+'table','class':'BWETabMsg','style':'width:100%;'},,,'div'],
						'thead':['thead',,,,'table'],
						'tr':['tr',{'id':'BWE'+page+'header','class':'tblheader'},,,'thead'],
						'tbody':['tbody',{'id':'BWE'+page+'body'},,,'table']},
						newTable = IU._CreateElements(newTableIU);
					ttable.parentNode.insertBefore(newTable['div'],ttable.nextSibling);
					CreateTable(theader,tlist,page);
					ttable.setAttribute('style','display:none');
					}
				}
			else if (page=='pMsg'||page=='pMsgSave'){
				// Analyse le message d'embuscade
				var msgContent = DOM._GetFirstNodeInnerHTML("//div[@class='msg-content ']", null);
				if (msgContent!=null&&PREF._Get('div','chLo')==1){
					// embuscade
					var result = new RegExp(L._Get('sAmbushTest1')).exec(msgContent);
					if (result!=null){
						var att = result[1],
							def = result[2],
							emb = ['','','','',[],[],[],[],[],[],[],[],[]], //[%,réussite,PV att,PV def,aa,ad,ea,ed,ca,cd,pa,pd,ressources]
							qsMid = DOM._QueryString("mid");
						// liste des éléments à récupérer suivant les options
						var logShow = [], divShow = [], GaShow = [],
							logCol = PREF._Get('hlog','list'), // 31-36
							div = PREF._Get('hdiv','list'), // 37-42
							Ga = PREF._Get('hres','list'); //56-61
						for (var i=0;i<logCol.length;i++){logShow[logCol[i][0]-31]=logCol[i][1];}
						for (var i=0;i<div.length;i++){divShow[div[i][0]-37]=div[i][1];}
						for (var i=0;i<Ga.length;i++){GaShow[Ga[i][0]-56]=Ga[i][1];}
						// Chance de réussite
						var result = new RegExp(L._Get('sAmbushTest2')).exec(msgContent);
						if (result!=null&&divShow[1]==1) emb[0] = result[1];
						// embuscade réussie
						var result = new RegExp(L._Get('sAmbushTest3',att)).exec(msgContent);
						if (result!=null){
							// résultat
							var result1 = new RegExp(L._Get('sAmbushTest4')).exec(msgContent),
								result2 = new RegExp(L._Get('sAmbushTest5',def)).exec(msgContent),
								result3 = new RegExp(L._Get('sAmbushTest6')).exec(msgContent);
							if (result1!=null){
								emb[1] = 'v';
								if (logShow[5]==1){
									// ressources (pdp,pdh,lol,sang,pop,évo)
									var result = new RegExp(L._Get('sAmbushTest13',att)).exec(msgContent);
									if (result!=null&&GaShow[0]==1) emb[12][0] = Number(result[1]);
									var result = new RegExp(L._Get('sAmbushTest14',att)).exec(msgContent);
									if (result!=null){
										if (GaShow[0]==1) emb[12][0] = Number(result[1]);
										if (GaShow[1]==1) emb[12][1] = Number(result[2]);
										}
									var result = new RegExp(L._Get('sAmbushTest15',def)).exec(msgContent);
									if (result!=null){
										if (GaShow[3]==1) emb[12][3] = Number(result[1]);
										if (GaShow[4]==1) emb[12][4] = Number(result[2]);
										if (GaShow[5]==1) emb[12][5] = Number(result[3]);
										}
									var result = new RegExp(L._Get('sAmbushTest16',att)).exec(msgContent);
									if (result!=null&&GaShow[2]==1) emb[12][2] = Number(result[1]);
									}
								}
							else if (result2!=null){
								emb[1] = 'd';
								if (logShow[5]==1){
									// ressources (pdp,lol,sang,pop)
									var result = new RegExp(L._Get('sAmbushTest13',def)).exec(msgContent);
									if (result!=null&&GaShow[0]==1) emb[12][0] = Number(result[1]);
									var result = new RegExp(L._Get('sAmbushTest15',att)).exec(msgContent);
									if (result!=null){
										if (GaShow[3]==1) emb[12][3] = Number(result[1]);
										if (GaShow[4]==1) emb[12][4] = Number(result[2]);
										if (GaShow[5]==1) emb[12][5] = Number(result[3]);
										}
									}
								}
							else if (result3!=null) emb[1] = 'n';
							// PV en fin de combat
							var sommaire = DOM._GetLastNodeInnerHTML("//div[@class='sum2']",null);
							if (sommaire!=null){
								var result = new RegExp(L._Get('sAmbushTest7')).exec(sommaire);
								if (result!=null){
									if (logShow[1]==1&&divShow[2]==1) emb[2] = L._Get('sPVFormat',result[1],result[2]);
									if (logShow[1]==1&&divShow[3]==1) emb[3] = L._Get('sPVFormat',result[3],result[4]);
									}
								}
							}
						// embuscade ratée : "Tu as été remarquée..."
						else emb[1] = 'r';
						// Arcanes
						if (logShow[2]==1){
							var i,model = new RegExp(L._Get('sAmbushTest8'),'g'),
								arc = L._Get('sArc');
							while ((i=model.exec(msgContent))!=null){
								if (i[2]==att) emb[4].push([arc.indexOf(i[3]),Number(i[4])]);
								else if (i[2]==def) emb[5].push([arc.indexOf(i[3]),Number(i[4])]);
								}
							}
						// Evolutions
						if (logShow[3]==1){
							var i,model = new RegExp(L._Get('sAmbushTest9'),'g'),
								evo = L._Get('sEvo');
							while ((i=model.exec(msgContent))!=null){
								var y, model2 = new RegExp(L._Get('sAmbushTest10'),'g');
								while ((y=model2.exec(i[1]))!=null){
									if (i[2]==att) emb[6].push([evo.indexOf(y[2]),Number(y[3])]);
									else if (i[2]==def) emb[7].push([evo.indexOf(y[2]),Number(y[3])]);
									}
								}
							}
						// Caracs - sauvegarde l'ensemble - titres 43-55
						if (logShow[4]==1){
							var table = DOM._GetFirstNodeInnerHTML("//table[@class='fight']");
							if (table!=null){
								for (var i=0;i<13; i++){
								var result = new RegExp(L._Get('sAmbushTest11',L._Get('sColTitle')[i+43])).exec(table);
									if (result!=null){
										emb[8][i] = i==1?result[1]:Number(result[1]);
										emb[9][i] = i==1?result[2]:Number(result[2]);
										}
									}
								}
							}
						// Objets
						if (logShow[1]==1){
							var i,model = new RegExp(L._Get('sAmbushTest12'),'g'),
								obj = L._Get('sObjet');
							while ((i=model.exec(msgContent))!=null){
								if (i[2]==att&&divShow[4]==1) emb[10].push(obj.indexOf(i[3]));
								else if (i[2]==def&&divShow[5]==1) emb[11].push(obj.indexOf(i[3]));
								}
							}
						UpdateHistory(att==player?ID:att,def==player?ID:def,qsMid,null,emb);
						}
					}
				}
			else if (page=='pMsgFriendList'&&PREF._Get(page,'sh')==1){
				var theader = DOM._GetFirstNode("//div[@id='content-mid']//tr[@class='tblheader']"),
					ttable = DOM._GetFirstNode("./ancestor::table[last()]",theader),
					tlist = DOM._GetNodes("./following-sibling::tr",theader);
				if (ttable!=null&&theader!=null&&tlist!=null){
					var newTableIU = {
						'div':['div',{'id':'BWE'+page+'div','align':'center'},],
						'table':['table',{'id':'BWE'+page+'table','style':'width:300px;'},,,'div'],
						'thead':['thead',,,,'table'],
						'tr':['tr',{'id':'BWE'+page+'header','class':'tblheader'},,,'thead'],
						'tbody':['tbody',{'id':'BWE'+page+'body'},,,'table'],},
						newTable = IU._CreateElements(newTableIU);
					ttable.parentNode.insertBefore(newTable['div'],ttable.nextSibling);
					CreateTable(theader,tlist,page);
					ttable.setAttribute('style','display:none');
					}
				}
			else if (page=='pRank'&&PREF._Get(page,'sh')==1){
				var ttable = DOM._GetFirstNode("//div[@id='content-mid']//table[@class='rank']"),
					theader = DOM._GetFirstNode("./tbody/tr[@class='tblheader']",ttable),
					tlist = DOM._GetNodes("./following-sibling::tr",theader);
				if (ttable!=null&&theader!=null&&tlist!=null){
					var newTableIU = {
						'div':['div',{'id':'BWE'+page+'div','align':'center'},],
						'table':['table',{'id':'BWE'+page+'table','style':'width:95%;'},,,'div'],
						'thead':['thead',,,,'table'],
						'tr':['tr',{'id':'BWE'+page+'header','class':'tblheader'},,,'thead'],
						'tbody':['tbody',{'id':'BWE'+page+'body'},,,'table'],},
						newTable = IU._CreateElements(newTableIU);
					ttable.parentNode.insertBefore(newTable['div'],ttable.nextSibling);
					CreateTable(theader,tlist,page);
					ttable.setAttribute('style','display:none');
					}
				}
			else if (page=='pRootSettings'||page=='pSettingsAi'||page=='pSettingsAcc'||page=='pSettingsVac'||page=='pSettingsDelchar'){
				var nodeOptions = DOM._GetFirstNode("//div[@id='content-mid']//div[@class='top-options']");
				if (nodeOptions!=null){
					var titleMenuIU = {
						'1':['div',,[' - [ '],,nodeOptions],
						'2':['a',{'href':'#','onclick':'return false;'},[L._Get("sTitleMenu1")],{'click':[setMenuOptions]},'1'],
						'3':['span',,[' ] - [ '],,'1'],
						'4':['a',{'href':'#','onclick':'return false;'},[L._Get("sTitleMenu2")],{'click':[setMenuDB]},'1'],
						'5':['span',,[' ]'],,'1']},
						nodeTitle = IU._CreateElements(titleMenuIU);
					}
				}
			}
		else alert(L._Get("sUnknowID"));
		}
	}
console.debug('BWEEnd');
})();
