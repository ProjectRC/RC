var https = require('https');
var http = require('http');
var express = require('express');
var fs = require('fs'); 
var path = require('path');
//var ejs =require('ejs');
var session = require('express-session'); 
var morgan = require('morgan'); 
var cookieParser = require('cookie-parser'); 
var bodyParser = require('body-parser'); 
//var sys = require('util');

var KEYS = require('./Consumer_Keys.json');

//var readline = require('readline');
//var google = require('googleapis');
//var googleAuth = require('google-auth-library');

var OAuth= require('oauth').OAuth;
var redis = require('redis');
var RedisStore = require('connect-redis')(session);
var Client = redis.createClient();
var app = express();

app.set('views', './views');
app.set('view engine','ejs');

//var passport = require('passport');

app.use(express.static(path.join(__dirname, 'client')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(cookieParser());
app.use(session({ secret: 'scemo chi legge', resave: false, saveUninitialized : false, cookie : {secure : true}, store: new RedisStore({ host : 'localhost', port : 6379, client: Client, ttl : 260})}));
app.use(app.router);

var password = "murobronzino";
var global_email;
//var amqp = require('amqplib/callback_api'); //RabbitMq
var coda;
var count = 0;
var global_category;
var global_num = 0;
var num_leg = 0;
var num_scie = 0;
var num_tec = 0;
var num_uff = 0;
var num_comm = 0;
var num_art = 0;
var num_cond = 0;
var num_nq = 0;
var num_forze = 0;
var num_altro = 0;
var global_array = new Array();
var array_leg = new Array();
var array_scie = new Array();
var array_tec = new Array();
var array_uff = new Array();
var array_comm = new Array();
var array_art = new Array();
var array_cond = new Array();
var array_nq = new Array();
var array_forze = new Array();
var array_altro = new Array();
var i;
for(i=0;i<5;i++) {
  global_array[i] = new Array();
  array_leg[i] = new Array();
  array_scie[i] = new Array();
  array_tec[i] = new Array();
  array_uff[i] = new Array();
  array_comm[i] = new Array();
  array_art[i] = new Array();
  array_cond[i] = new Array();
  array_nq[i] = new Array();
  array_forze[i] = new Array();
  array_altro[i] = new Array();
}
var amqp = require('amqp');
//app.connectionStatus = 'No server connection';
//app.exchangeStatus = 'No exchange established';
//app.queueStatus = 'No queue established';

var server = http.createServer(app);

var Firebase = require("firebase"); //richiede firebase library
var myFirebaseRef = new Firebase("https://progetto-reti.firebaseio.com/");


function offerta(titolo, testo, categoria, username, email, citta, provincia){     // costruttore oggetto offerta
	this.titolo = titolo;
	this.testo = testo;
	this.categoria = categoria;
	this.username = username;
	this.email = email;
	this.citta = citta;
  this.provincia = provincia;
}

//------------------------------------------------------

app.get('/', function(req,res){

  console.log("Request: " + req.url);
  fs.readFile("index.html", function(err, text){
      if(err) console.log(err);
      res.setHeader("Content-Type", "text/html");
      res.end(text);
    });
    
});

/*app.get('/', function(req, res){
  app.rabbitMqConnection = amqp.createConnection({ host: 'localhost' });
  console.log("Rabbitmq server connected");
});*/

//--------------- MESSAGE-US FACEBOOK---------------------------------------------
/*Funziona solo con me per ora perchè non è pubblica.
 Devo mettere nell' app di fb:
 un file con un esempio di gestione della chat(uno screencast...)
 
Alla tua richiesta mancano informazioni nei seguenti campi:
Icona dell'applicazione
URL Normativa sulla privacy
*/

var request = require('request');

var token_page='EAAPLqGr66CwBADm1aqpmpZAAaH9MN0zbDOtT22fpjPDZBWDpjd9wcrTSmvX6JJmtGsWBu7qIZBzNXny5hUvZAxx08rPqnhl0VuvtZC9a5wAUEkg0qqmLXKC8jUi4zvhQ7yuvtUZAsCFTNonGb958D3HdBPFwLYBYj8knbajrToUwZDZD';
//var token='c7e480c7e351fb84a5a6ea84e04a2a29';//chiave segreta

app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'token') {
    res.send(req.query['hub.challenge']);
  }
  console.log(req.query['hub.challenge']);//1622095706
  res.send('Error, wrong validation token');
});

var messaging_events,sender,text;
//we're specifically listening for a callback when a message is sent to the Page.
app.post('/webhook', function (req, res) {
  console.log("post webhook");
  messaging_events = req.body.entry[0].messaging;
  for (var i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      /*if (text === 'Generic') {
      sendGenericMessage(sender);
      continue;
      }*/
      if (text === 'Yes' || text === 'yes'){
        sendGenericMessage(sender);
        continue;
      }
      if (text === 'No' || text === 'no'){
        sendTextMessage(sender, "Oh no :( ... Fell free to send me a message when you want! Goodbye!");
        continue;
      }
      sendTextMessage(sender, "Hi! I'm Wallofwork and I can help you to find the job of your life!"+
      " Are you looking for a job?");
      
    }
  }
  res.status(200).send(http.STATUS_CODES[200]);
});


//Below is a function that will send back a text message with whatever we send to the page.
function sendTextMessage(sender, text) {
  var messageData = {
    text:text
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token_page},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

function sendGenericMessage(sender) {
  var messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://lavoraconnoi-italia.it/wp-content/uploads/2015/04/Cerca-Lavoro.jpg",
          "buttons": [{
            "type": "web_url",
            "url": "https://project-cloned-mitra94.c9users.io",
            "title": "Web url Wallofwork"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token_page},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}


//-------------------TWITTER-------------------------------


var consumerKey =  KEYS.cons_key_twitter;
var consumerSecret =  KEYS.cons_secret_twitter;

var accessToken = '708600803012026368-8c34K0o40VgvnazKeXApsme8Ir5lOWD';
var accessTokenSecret = 'F6NfcChgVfJFQ1Fd8TXBHlZnoLbkPgaGiT1YCbg054qkX';
                          
var oauth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  consumerKey,
  consumerSecret,
  '1.0A',
  "https://project-cloned-mitra94.c9users.io/auth/twitter/callback",
  'HMAC-SHA1'
);
                                
app.get('/auth/twitter', function(req, res) {
 
  oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
    if (error) {
      console.log(error);
      res.send("Authentication Failed!");
    }
    else {
      req.session = {
        token: oauth_token,
        token_secret: oauth_token_secret
      };
      console.log(req.session);
      res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token+'&force_login=true');
    }
  });
});

app.get('/auth/twitter/callback', function(req, res, next) {
  if (req.session) {
    req.session.verifier = req.query.oauth_verifier;
    var oauth_data = req.session;
    oauth.getOAuthAccessToken(
      oauth_data.token,
      oauth_data.token_secret,
      oauth_data.verifier,
      function(error, oauth_access_token, oauth_access_token_secret, results) {
        if (error) {
          console.log(error);
          res.send("Authentication Failure!");
        }
        else {
          req.session.oauth.access_token = oauth_access_token;
          req.session.oauth.access_token_secret = oauth_access_token_secret;
          console.log(results, req.session);
          res.send("Authentication Successful");
        }
      }
    );
  }
  else {
    res.redirect('/twitter.html');
  }
});

var Twitter = require('twitter');
var client = new Twitter({
  consumer_key: consumerKey,
  consumer_secret: consumerSecret,
  access_token_key: accessToken,
  access_token_secret: accessTokenSecret
});


app.get('/twitterUserInfo', function(req, res){
  client.get('account/verify_credentials.json', function(error, data, response){
    res.redirect('https://twitter.com/intent/user?screen_name=' + data.screen_name);
  });
});


app.get('/logout', function(req, res){
  res.redirect('/');
});


// --------------LINKEDIN---------------------------------------
// Per usare le Api di linkedin serve un autorizzazione di Linkedin stesso
//ad utilizzare le loro vetter API http://stackoverflow.com/questions/13601768/linkedin-javascript-api-access-to-people-denied
// ergo.. stop work here

var APIKey = KEYS.cons_key_linkedin;
var APIKeySecret = KEYS.cons_secret_linkedin;
var idUtente=0;
var url = require('url');
var APICalls = [];

// My Profile and My Data APIS
APICalls['myProfile'] = 'people/~:(first-name,last-name,headline,location,picture-url,email-address)';
APICalls['myConnections'] = 'people/~/connections';
APICalls['myNetworkShares'] = 'people/~/shares';
APICalls['myNetworksUpdates'] = 'people/~/network/updates';
APICalls['myNetworkUpdates'] = 'people/~/network/updates?scope=self';
APICalls['Share'] = 'people/~/shares?format=json';

// PEOPLE SEARCH APIS
// Be sure to change the keywords or facets accordingly
APICalls['peopleSearchWithKeywords'] = 'people-search:(people:(id,first-name,last-name,picture-url,headline),num-results,facets)?keywords=Hacker+in+Residence';
APICalls['peopleSearchWithFacets'] = 'people-search:(people,facets)?facet=location,us:84';

// GROUPS APIS
// Be sure to change the GroupId accordingly
APICalls['myGroups'] = 'people/~/group-memberships?membership-state=member';
APICalls['groupSuggestions'] = 'people/~/suggestions/groups';
APICalls['groupPosts'] = 'groups/12345/posts:(title,summary,creator)?order=recency';
APICalls['groupDetails'] = 'groups/12345:(id,name,short-description,description,posts)';

// COMPANY APIS
// Be sure to change the CompanyId or facets accordingly
APICalls['myFollowingCompanies'] = 'people/~/following/companies';
APICalls['myFollowCompanySuggestions'] = 'people/~/suggestions/to-follow/companies';
APICalls['companyDetails'] = 'companies/1337:(id,name,description,industry,logo-url)';
APICalls['companySearch'] = 'company-search:(companies,facets)?format=json,facet=location,us:84';
APICalls['companyS'] = 'company-search:(companies:(name,universal-name,website-url))?format=json';
APICalls['manageCompany'] ='companies?format=json&is-company-admin=true';
APICalls['companyUpdates'] = 'companies/2414183/updates?format=json';
APICalls['companyShare'] = 'companies/2414183/shares?format=json';
APICalls['companyAdmin'] = 'companies/2414183/relation-to-viewer/is-company-share-enabled?format=json';

// JOBS APIS
// Be sure to change the JobId or facets accordingly
APICalls['myJobSuggestions'] = 'people/~/suggestions/job-suggestions';
APICalls['myJobBookmarks'] = 'people/~/job-bookmarks';
APICalls['jobDetails'] = 'jobs/1452577:(id,company:(name),position:(title))';
APICalls['jobSearch'] = 'job-search:(jobs:(id,customer-job-code,posting-date,expiration-date,posting-timestamp,expiration-timestamp,company:(id,name),position:(title,location,job-functions,industries,job-type,experience-level)))?format=json';

var callbackURL = "http://localhost:3000/auth/linkedin";
var APIVersion = "v1";

// scope variables
var APIScope = 'r_basicprofile r_emailaddress w_share';
var access_token;

app.get('/auth/linkedin',function(req, response) {
  
			var queryObject = url.parse(req.url, true).query;

			if (!queryObject.code) {
				// STEP 1 - If this is the first run send them to LinkedIn for Auth
				OauthStep1(req, response);
			} else {
				// STEP 2 - If they have given consent and are at the callback do the final token request
				OauthStep2(req, response, queryObject.code);
			}

});


var RandomState = function(howLong) {
	
		howLong=parseInt(howLong);
		
		if (!howLong || howLong<=0) {
			howLong=18;
		}
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";

		for (var i = 0; i < howLong; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}

//////////////////////////////////////////////////////////////
// Oauth Step 1 - Redirect end-user for authorization
var OauthStep1 = function(req, response) {

		console.log("Step1");

		response.writeHead(302, {
			'Location': 'https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=' + APIKey + '&scope=' + APIScope + '&state=RNDM_' + RandomState(18) + '&redirect_uri=' + callbackURL
		});
		response.end();
	};

//////////////////////////////////////////////////////////////
// Oauth Step 2 - The callback post authorization
var OauthStep2 = function(request, response, code) {

		console.log("Step2");

		var options = {
			host: 'api.linkedin.com',
			port: 443,
			path: "/uas/oauth2/accessToken?grant_type=authorization_code&code=" + code + "&redirect_uri=" + callbackURL + "&client_id=" + APIKey + "&client_secret=" + APIKeySecret
		};

		var req = https.request(options, function(res) {
			console.log("statusCode: ", res.statusCode);
			console.log("headers: ", res.headers);

			res.on('data', function(d) {
				
				access_token = JSON.parse(d).access_token;
				/*
				var ExpiresIn29days = new Date();
				ExpiresIn29days.setDate(in30days.getDate() + 29);
				response.writeHead(200, {
				  'Set-Cookie':'LIAccess_token=' + access_token + '; Expires=' + ExpiresIn29days
				});*/
				OauthStep3(request, response, access_token, APICalls['myProfile']);
			});
		});
		
		req.on('error', function(e) {
			console.error("There was an error with our Oauth Call in Step 2: " + e);
			response.end("There was an error with our Oauth Call in Step 2");
		});
		req.end();
	};
	
var name, surname, email, location, picture;

// Get name and surname data below
var OauthStep3 = function(request, response, access_token, APICall, callback) {
    
    // function for APICalls['myProfile']
		console.log("Step3");
		
		var JSONformat;
		if (APICall.indexOf("?")>=0) {
			 JSONformat="&format=json";
		} else {
			 JSONformat="?format=json";
		}
		
		var options = {
			host: 'api.linkedin.com',
			port: 443,
			path: '/'+APIVersion+'/' + APICall + JSONformat + "&oauth2_access_token=" + access_token
		};

		var req = https.request(options, function(res) {
			console.log("statusCode: ", res.statusCode);
			console.log("headers: ", res.headers);
      
			res.on('data', function(d) {
				
				var body =JSON.parse(d);
			  name=body.firstName, surname=body.lastName,
				location=body.location.name, email= body.emailAddress,
				picture= body.pictureUrl;
				
				myFirebaseRef.child('users').child(idUtente).child("nome").set(name+ " "+surname);
				myFirebaseRef.child('users').child(idUtente).child("token").set(accessToken);
				idUtente++;
				
				response.redirect("/visualizzaAnnuncio");
				//visualizzaAnnuncio(name,surname,picture,req,response)
				console.log('Name: ',name +',Surname: ', surname + ',Location:', location + ',Email: ',email +' Picture: ' +picture);
			});
		});

		req.on('error', function(e) {
			console.error("There was an error with our LinkedIn API Call in Step 3: " + e);
			response.end("There was an error with our LinkedIn API Call in Step 3");
		});
		req.end();
};

app.get('/logoutLinkedin', function(req, res){
  console.log("User logout");
  //req.logout();
  res.redirect('/');
});


//-------------------------MAPS-------------------------------------------

app.get('/maps', function(req,res){

  console.log("Request for maps");
  fs.readFile("maps.html", function(err, text){
      if(err) console.log(err);
      res.setHeader("Content-Type", "text/html");
      res.end(text);
    });
  return;
  
});

//------------------------MAIL---------------------------------------------
app.post('/contattaUtente', function(req,res) {
  global_email = req.body.email;
  console.log(global_email);
  res.redirect('contattaci.html');
});


// quello sotto oppure meglio con  https://developers.google.com/gmail/api/quickstart/nodejs 
app.post('/sendEmail', function(req, res) {
 
  var nodemailer = require('nodemailer');

  
  var sender = req.body.email;
  var name = req.body.nome+" "+req.body.cognome;
  var to = global_email;
  var text = req.body.testo;
  var number = req.body.numero;
  
  // Create a SMTP transport object
  var transport = nodemailer.createTransport("SMTP", {
          service: 'Gmail',
          auth: {
                user : "wallofjobs@gmail.com",
                pass : password
          }
      }); 
  
  console.log('SMTP Configured');
  
  // Message object
  var message = {

      // sender info
      from: sender,
      
      // Comma separated list of recipients
      to: to,
      
      // Subject of the message
      subject: 'New Candidature', 
      
      // plaintext body
      text: 'You have received a candidature from Wall Of Work. Details : '+name+' '+sender+' '+number+' '+text,
      
      // HTML body
      html:'<p>You got a new candidature with the following details : <p><ul><li>Name: '+name+'</li><li>Email: '+sender+'</li><li>Telephone: '+number+'</li><li>Message: '+text+'</li></ul></p>'
  };
  
  console.log('Sending Mail');
  transport.sendMail(message, function(error,info){
    if(error){
        console.log('Error occured');
        console.log(error.message);
        res.redirect("/visualizzaAnnuncio");
    }
    else {
      console.log('Message sent successfully!');
      res.redirect("/visualizzaAnnuncio");
    }
    transport.close();
  });
});

//-------------------------FIREBASE----------------------------------------



/*function convertToText(obj) {																												//converte object in stringa
    //create an array that will later be joined into a string.
    var string = [];
    var prop;

    //is object
    //    Both arrays and objects seem to return "object"
    //    when typeof(obj) is applied to them. So instead
    //    I am checking to see if they have the property
    //    join, which normal objects don't have but
    //    arrays do.
    if (typeof(obj) == "object" && (obj.join == undefined)) {
        string.push("{");
        for (prop in obj) {
            string.push(prop, ": ", convertToText(obj[prop]), ",");
        };
        string.push("}");

    //is array
    } else if (typeof(obj) == "object" && !(obj.join == undefined)) {
        string.push("[")
        for(prop in obj) {
            string.push(convertToText(obj[prop]), ",");
        }
        string.push("]")

    //is function
    } else if (typeof(obj) == "function") {
        string.push(obj.toString())

    //all other values can be done with JSON.stringify
    } else {
        string.push(JSON.stringify(obj))
    }

    return string.join("")
}               */

function stampaMatrice(matrice){
  var i=0;
  var j=0;
  for(i=0;i<matrice.length; i++){
    for(j=0;j<matrice[i].length;j++){
      console.log("%s , ",matrice[i][j]);
    }
    console.log("\n");
  }
  
}

var key;

app.post('/inserisciOfferta', function(req, res) {			//inserimento offerta di lavoro
    
    
    
    var titolo = req.body.titolo;
    var testo = req.body.testo;
    var categoria = req.body.categoria;
    var nome = name + " " + surname; // ho cambiuato qui
    var email = req.body.email;
    var citta =req.body.citta;
    var provincia =req.body.provincia;
    
      
    
    
    var off = new offerta(titolo, testo, categoria, nome, email, citta, provincia);
    
    var post_id = myFirebaseRef.child("offerte").push(off);
    key = post_id.key();
    res.render('inserito', {key : key });
   
    var notifica = new Array(titolo, testo, categoria, nome, email, citta, provincia);
    //riempi_array(global_array,notifica);
    notification(notifica);
   
    console.log("post received: %s %s %s %s %s %s %s",titolo, testo, categoria, nome, email, citta, provincia, post_id.key());
    
});

var visualizzaAnnuncio = function(name, surname, picture, req, res){
  var matrice= new Array();
  var i;
  for(i=0;i<5;i++){
    matrice[i]=new Array();
  }
  var colonne= 0;
  var righe= 0;
  myFirebaseRef.child('offerte')
  .limitToLast(5)
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  		childsnap.forEach(function(campi){
  		  matrice[colonne][righe]= campi.val();
  		  righe+=1;
  		})
  	
  		righe=0;
  		if(colonne==4){
  		  //stampaMatrice(matrice);
  		  res.render('visualizzaAnnunci',{name : name, surname : surname, Img : picture,
  		                                  categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  		                                  categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                  categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                  categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6],
  		                                  categoria5 : matrice[4][0] , citta5 : matrice[4][1], email5 : matrice[4][2] , provincia5 : matrice[4][3] , testo5 : matrice[4][4], titolo5 : matrice[4][5] , username5 : matrice[4][6]
  		  });
  		}
  		colonne++;
  	})              
    //console.log("finito figlio"); //controllo
  })
  //console.log("finito get");  //controllo
};

app.get('/visualizzaAnnuncio',function(req,res){
  //console.log("avvio get");// controllo
  
  var matrice= new Array();
  var i;
  for(i=0;i<5;i++){
    matrice[i]=new Array();
  }
  var colonne= 0;
  var righe= 0;
  myFirebaseRef.child('offerte')
  .limitToLast(5)
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  		childsnap.forEach(function(campi){
  		  matrice[colonne][righe]= campi.val();
  		  righe+=1;
  		})
  	
  		righe=0;
  		if(colonne==4){
  		  
  		  if(matrice[0][0] === ""){
  	      res.render('ricercaEmpty');
  	    }
  	
  	    if(matrice[1][0] === ""){
  	      res.render('OFFvisualizzaAnnunci1', {name : name, surname : surname, Img : picture,
  	                                           categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6]});
  	    }
  	
  	    if(matrice[2][0] === ""){
  	      res.render('OFFvisualizzaAnnunci2', {name : name, surname : surname, Img : picture,
  	                                           categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  	                                           categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6]
  	      });
  	    }
  	
  	    if(matrice[3][0] === ""){
  	      res.render('OFFvisualizzaAnnunci3', {name : name, surname : surname, Img : picture,
  	                                           categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                           categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                         categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  	      });
  	    }
  	
  	    if(matrice[4][0] === ""){
  	      res.render('OFFvisualizzaAnnunci4', {name : name, surname : surname, Img : picture,
  	                                           categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                           categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                         categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                         categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6]
  	      });
  	    }
  	
  	    else{
  		  //stampaMatrice(matrice);
  		  res.render('visualizzaAnnunci',{name : name, surname : surname, Img : picture,
  		                                  categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  		                                  categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                  categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                  categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6],
  		                                  categoria5 : matrice[4][0] , citta5 : matrice[4][1], email5 : matrice[4][2] , provincia5 : matrice[4][3] , testo5 : matrice[4][4], titolo5 : matrice[4][5] , username5 : matrice[4][6]
  		  });
  	    }
  		}
  		colonne++;
  	})              
    //console.log("finito figlio"); //controllo
  })
  //console.log("finito get");  //controllo
  
});

app.get('/OFFvisualizzaAnnuncio',function(req,res){
  //console.log("avvio get"); controllo
  
  var matrice = new Array();
  var i;
  for(i=0;i<5;i++){
    matrice[i]=new Array();
  }
  var colonne= 0;
  var righe= 0;
  myFirebaseRef.child('offerte')
  .limitToLast(5)
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  		childsnap.forEach(function(campi){
  		  matrice[colonne][righe]= campi.val();
  		  righe+=1;
  		})
  	
  		righe=0;
  		if(colonne==4){
  		  //stampaMatrice(matrice);
  		  
  		  if(matrice[0][0] === ""){
  	      res.render('OFFricercaEmpty');
  	    }
  	
  	    if(matrice[1][0] === ""){
  	      res.render('OFFvisualizzaAnnunci1', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6]});
  	    }
  	
  	    if(matrice[2][0] === ""){
  	      res.render('OFFvisualizzaAnnunci2', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  	                                           categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6]
  	      });
  	    }
  	    
  	    if(matrice[3][0] === ""){
  	      res.render('OFFvisualizzaAnnunci3', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                           categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                         categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  	      });
  	    }
  	
  	    if(matrice[4][0] === ""){
  	      res.render('OFFvisualizzaAnnunci4', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                           categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                         categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                         categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6]
  	      });
  	    }
  	    
  	    else{
  	      
  		    res.render('OFFvisualizzaAnnunci', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  		                                        categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                        categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                        categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6],
  		                                        categoria5 : matrice[4][0] , citta5 : matrice[4][1], email5 : matrice[4][2] , provincia5 : matrice[4][3] , testo5 : matrice[4][4], titolo5 : matrice[4][5] , username5 : matrice[4][6]
  		  
  		    });
  	    }
  		}
  		colonne++;
  	})              
    //console.log("finito figlio"); controllo
  })
  //console.log("finito get");  controllo
});

app.get('/cercaCategoria', function(req, res){
  
  var categoria = req.param('categoria');
  
  var matrice = new Array();
  
  var righe = 0;
  var colonne = 0;
  
  for(righe = 0; righe < 5; righe++){
  	 matrice[righe] = new Array();     
  }
  
  for(righe = 0; righe < 5; righe++){
    for(colonne = 0; colonne < 7; colonne++){
      matrice[righe][colonne] = "";
    }
  }
  
  righe = 0;
  	    
  
  myFirebaseRef.child('offerte')
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  	  var data = childsnap.exportVal();
  	  
  	  if(data.categoria == categoria && righe  < 5){
  	    
  	    
  	    
  	    matrice[righe][0] = data.categoria;
  	    matrice[righe][1] = data.citta;
  	    matrice[righe][2] = data.email;
  	    matrice[righe][3] = data.provincia;
  	    matrice[righe][4] = data.testo;
  	    matrice[righe][5] = data.titolo;
  	    matrice[righe][6] = data.username;
  	    
  	    righe++;
  	    
  	  }
  	});
  	if(matrice[0][0] === ""){
  	  res.render('OFFricercaEmpty');
  	}
  	if(matrice[1][0] === ""){
  	  res.render('OFFvisualizzaAnnunci1', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6]});
  	}
  	if(matrice[2][0] === ""){
  	  res.render('OFFvisualizzaAnnunci2', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6]
  	  });
  	}
  	if(matrice[3][0] === ""){
  	  res.render('OFFvisualizzaAnnunci3', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                     categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  	  });
  	}
  	if(matrice[4][0] === ""){
  	  res.render('OFFvisualizzaAnnunci4', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                     categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                     categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6]
  	  });
  	}
  	else{
  	res.render('ricercaCategoria', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  		                              categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                              categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                              categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6],
  		                              categoria5 : matrice[4][0] , citta5 : matrice[4][1], email5 : matrice[4][2] , provincia5 : matrice[4][3] , testo5 : matrice[4][4], titolo5 : matrice[4][5] , username5 : matrice[4][6]
  		  
  		  });
  	}
  });
  
});


app.get('/cercaTitolo', function(req, res){
  
  var titolo = req.param('titolo');
  
  var matrice = new Array();
  
  var righe = 0;
  var colonne = 0;
  
  for(righe = 0; righe < 5; righe++){
  	 matrice[righe] = new Array();     
  }
  
  for(righe = 0; righe < 5; righe++){
    for(colonne = 0; colonne < 7; colonne++){
      matrice[righe][colonne] = "";
    }
  }
  
  righe = 0;
  	    
  
  myFirebaseRef.child('offerte')
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  	  var data = childsnap.exportVal();
  	  
  	  if(data.titolo == titolo && righe  < 5){
  	    
  	    
  	    
  	    matrice[righe][0] = data.categoria;
  	    matrice[righe][1] = data.citta;
  	    matrice[righe][2] = data.email;
  	    matrice[righe][3] = data.provincia;
  	    matrice[righe][4] = data.testo;
  	    matrice[righe][5] = data.titolo;
  	    matrice[righe][6] = data.username;
  	    
  	    righe++;
  	    
  	  }
  	});
  	if(matrice[0][0] === ""){
  	  res.render('OFFricercaEmpty');
  	}
  	if(matrice[1][0] === ""){
  	  res.render('OFFvisualizzaAnnunci1', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6]});
  	}
  	if(matrice[2][0] === ""){
  	  res.render('OFFvisualizzaAnnunci2', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6]
  	  });
  	}
  	if(matrice[3][0] === ""){
  	  res.render('OFFvisualizzaAnnunci3', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                     categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  	  });
  	}
  	if(matrice[4][0] === ""){
  	  res.render('OFFvisualizzaAnnunci4', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                     categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                     categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6]
  	  });
  	}
  	else {
  	res.render('ricercaTitolo',{categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  		                          categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                          categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                          categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6],
  		                          categoria5 : matrice[4][0] , citta5 : matrice[4][1], email5 : matrice[4][2] , provincia5 : matrice[4][3] , testo5 : matrice[4][4], titolo5 : matrice[4][5] , username5 : matrice[4][6]
  		  
  		  });
  	}
  });
  
});

app.get('/cercaCitta', function(req, res){
  
  var citta = req.param('citta');
  
  var matrice = new Array();
  
  var righe = 0;
  var colonne = 0;
  
  for(righe = 0; righe < 5; righe++){
  	 matrice[righe] = new Array();     
  }
  
  for(righe = 0; righe < 5; righe++){
    for(colonne = 0; colonne < 7; colonne++){
      matrice[righe][colonne] = "";
    }
  }
  
  righe = 0;
  	    
  
  myFirebaseRef.child('offerte')
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  	  var data = childsnap.exportVal();
  	  
  	  if(data.citta == citta && righe  < 5){
  	    
  	    
  	    
  	    matrice[righe][0] = data.categoria;
  	    matrice[righe][1] = data.citta
  	    matrice[righe][2] = data.email;
  	    matrice[righe][3] = data.provincia;
  	    matrice[righe][4] = data.testo;
  	    matrice[righe][5] = data.titolo;
  	    matrice[righe][6] = data.username;
  	    
  	    righe++;
  	    
  	  }
  	});
  	if(matrice[0][0] === ""){
  	  res.render('OFFricercaEmpty');
  	}
  	if(matrice[1][0] === ""){
  	  res.render('OFFvisualizzaAnnunci1', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6]});
  	}
  	if(matrice[2][0] === ""){
  	  res.render('OFFvisualizzaAnnunci2', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6]
  	  });
  	}
  	if(matrice[3][0] === ""){
  	  res.render('OFFvisualizzaAnnunci3', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                     categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  	  });
  	}
  	if(matrice[4][0] === ""){
  	  res.render('OFFvisualizzaAnnunci4', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                     categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                     categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6]
  	  });
  	}
  	else{
  	res.render('OFFvisualizzaAnnunci',{categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  		                              categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                              categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                              categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6],
  		                              categoria5 : matrice[4][0] , citta5 : matrice[4][1], email5 : matrice[4][2] , provincia5 : matrice[4][3] , testo5 : matrice[4][4], titolo5 : matrice[4][5] , username5 : matrice[4][6]
  		  
  		  });
  	}
  });
  
});

//var ap = location.split(" ");
//var googleTranslate = require('google-translate')(apiKey);
var keyTrans= 'rw57D79KesEoEiLoLXAbfdJjDOh0QizyGKrEiAA2hUw=',
  IdTrans = '4378593a-e1e1-4e92-a495-60089cdfa67';

var MsTranslator = require('mstranslator');
// Second parameter to constructor (true) indicates that
// the token should be auto-generated.


app.get('/cercaCittaVicino', function(req, res){
  
  location = location.split(" ");//ap[0];
  
  var client = new MsTranslator({
   client_id: IdTrans,
   client_secret: keyTrans
  }, true);

  var params = {
      text: location[0]
     , from: 'en'
     , to: 'it'
  };
   
  
  client.translate(params, function(err, citta) {
      
      console.log("Città dell' utente:", citta);
      var matrice = new Array();
      var righe = 0;
      var colonne = 0;
      
      for(righe = 0; righe < 5; righe++){
        matrice[righe] = new Array();     
        
      }
  
      for(righe = 0; righe < 5; righe++){
        for(colonne = 0; colonne < 7; colonne++){
          matrice[righe][colonne] = "";
        }
      }
  
    righe = 0;
  	    
  
    myFirebaseRef.child('offerte')
    .once('value', function(snap){
    	snap.forEach(function(childsnap){
    	  var data = childsnap.exportVal();
    	  
    	  if(data.citta == citta && righe  < 5){
    	    
    	    
    	    
    	    matrice[righe][0] = data.categoria;
    	    matrice[righe][1] = data.citta
    	    matrice[righe][2] = data.email;
    	    matrice[righe][3] = data.provincia;
    	    matrice[righe][4] = data.testo;
    	    matrice[righe][5] = data.titolo;
    	    matrice[righe][6] = data.username;
    	    
    	    righe++;
    	    
    	  }
    	});
    	if(matrice[0][0] === ""){
  	    res.render('ricercaEmpty');
  	  }
  	  
  	  if(matrice[1][0] === ""){
    	  res.render('visualizzaAnnunci1', {name : name, surname : surname, Img : picture,
    	                                    categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6]});
  	  }
  	
  	  if(matrice[2][0] === ""){
  	    res.render('visualizzaAnnunci2', {name : name, surname : surname, Img : picture,
  	                                      categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  	                                      categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6]
  	    });
  	
  	    
  	  }
  	
  	  if(matrice[3][0] === ""){
  	    res.render('visualizzaAnnunci3', {name : name, surname : surname, Img : picture,
  	                                      categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                      categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                    categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  	    });
  	  }
  	
  	  if(matrice[4][0] === ""){
  	    res.render('visualizzaAnnunci4', {name : name, surname : surname, Img : picture,
  	                                      categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                      categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                    categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                    categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6]
  	    });
  	  }
  	
  	  else{
    	
      	res.render('ricercaCitta',{name : name, surname : surname, Img : picture,
      	                           categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
      		                         categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
      		                         categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
    	  	                         categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6],
    		                           categoria5 : matrice[4][0] , citta5 : matrice[4][1], email5 : matrice[4][2] , provincia5 : matrice[4][3] , testo5 : matrice[4][4], titolo5 : matrice[4][5] , username5 : matrice[4][6]
    		  
    	 
    	  });
  	  }
      
    });
    
  });
  
});

app.get('/cercaProvincia', function(req, res){
  
  var provincia = req.param('provincia');
  
  var matrice = new Array();
  
  var righe = 0;
  var colonne = 0;
  
  for(righe = 0; righe < 5; righe++){
  	 matrice[righe] = new Array();     
  }
  
  for(righe = 0; righe < 5; righe++){
    for(colonne = 0; colonne < 7; colonne++){
      matrice[righe][colonne] = "";
    }
  }
  
  righe = 0;
  	    
  
  myFirebaseRef.child('offerte')
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  	  var data = childsnap.exportVal();
  	  
  	  if(data.provincia == provincia && righe  < 5){
  	    
  	    
  	    
  	    matrice[righe][0] = data.categoria;
  	    matrice[righe][1] = data.citta
  	    matrice[righe][2] = data.email;
  	    matrice[righe][3] = data.provincia;
  	    matrice[righe][4] = data.testo;
  	    matrice[righe][5] = data.titolo;
  	    matrice[righe][6] = data.username;
  	    
  	    righe++;
  	    
  	  }
  	});
  	if(matrice[0][0] === ""){
  	  res.render('OFFricercaEmpty');
  	}
  	if(matrice[1][0] === ""){
  	  res.render('OFFvisualizzaAnnunci1', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6]});
  	}
  	if(matrice[2][0] === ""){
  	  res.render('OFFvisualizzaAnnunci2', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6]
  	  });
  	}
  	if(matrice[3][0] === ""){
  	  res.render('OFFvisualizzaAnnunci3', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                     categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  	  });
  	}
  	if(matrice[4][0] === ""){
  	  res.render('OFFvisualizzaAnnunci4', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                     categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                     categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6]
  	  });
  	}
  	else {
  	res.render('ricercaProvincia',{categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  		                             categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                             categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                             categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6],
  		                             categoria5 : matrice[4][0] , citta5 : matrice[4][1], email5 : matrice[4][2] , provincia5 : matrice[4][3] , testo5 : matrice[4][4], titolo5 : matrice[4][5] , username5 : matrice[4][6]
  		  
  		  });
  	}
  });
  
});

app.get('/cercaUtente', function(req, res){
  
  var utente = name + " " + surname;
  
  var matrice = new Array();
  
  var righe = 0;
  var colonne = 0;
  
  for(righe = 0; righe < 5; righe++){
  	 matrice[righe] = new Array();     
  }
  
  for(righe = 0; righe < 5; righe++){
    for(colonne = 0; colonne < 7; colonne++){
      matrice[righe][colonne] = "";
    }
  }
  
  righe = 0;
  	    
  
  myFirebaseRef.child('offerte')
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  	  var data = childsnap.exportVal();
  	  
  	  if(data.username == utente && righe  < 5){
  	    
  	    
  	    
  	    matrice[righe][0] = data.categoria;
  	    matrice[righe][1] = data.citta
  	    matrice[righe][2] = data.email;
  	    matrice[righe][3] = data.provincia;
  	    matrice[righe][4] = data.testo;
  	    matrice[righe][5] = data.titolo;
  	    matrice[righe][6] = data.username;
  	    matrice[righe][7] = childsnap.key();
  	    righe++;
  	    
  	  }
  	});
  	if(matrice[0][0] === ""){
  	  res.render('ricercaEmpty');
  	}
  	if(matrice[1][0] === ""){
  	  res.render('OFFvisualizzaAnnunci1', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6]});
  	}
  	if(matrice[2][0] === ""){
  	  res.render('OFFvisualizzaAnnunci2', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6]
  	  });
  	}
  	if(matrice[3][0] === ""){
  	  res.render('OFFvisualizzaAnnunci3', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                     categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  	  });
  	}
  	if(matrice[4][0] === ""){
  	  res.render('OFFvisualizzaAnnunci4', {categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], 
  	                                       categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                     categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                     categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6]
  	  });
  	}
  	else
  	{
  	res.render('annunciUtente',{name : name, surname : surname, Img : picture,
  	                               categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6], key1 : matrice[0][7],
  		                             categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6], key2 : matrice[1][7], 
  		                             categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6], key3 : matrice[2][7],
  		                             categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6], key4 : matrice[3][7],
  		                             categoria5 : matrice[4][0] , citta5 : matrice[4][1], email5 : matrice[4][2] , provincia5 : matrice[4][3] , testo5 : matrice[4][4], titolo5 : matrice[4][5] , username5 : matrice[4][6], key5 : matrice[4][7]
  		  
  		  });
  	}
  });
  
});

  

app.post('/cancella', function(req,res){
  
  var chiave= req.param('chiave');
  var fireCanc=new  Firebase("https://progetto-reti.firebaseio.com/offerte/" + chiave);
  var onComplete = function(error) {
  if (error) {
    console.log('Synchronization failed');
    res.render('erroreCancellazione',{chiave: chiave});
  } else {
    console.log('Synchronization succeeded');
    res.render('cancellatoAnnuncio', {chiave:chiave});
  }
  };

    fireCanc.remove(onComplete);
  
      
   
    
});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});



// --------------------------------------------------------- RABBITMINQIU ------------------------------------------------------------------------------------------------------------------------------//
/*function riempi_array(array,notifica) {
  console.log(global_array);
  var righe = 0;
  var colonne = 0;
  while(array[righe] == "") {
    righe++;
  }
  global_array[righe][colonne] = "ciao";
  console.log(global_array);
  for(colonne;colonne<7;colonne++) {
    var temp = notifica[colonne];
    global_array[righe][colonne] = temp; 
  }
  colonne = 0;
  for(colonne;colonne<7;colonne++) {
    console.log("*"+global_array[righe][colonne]);
  }
}*/

function notification(offerta) {
  /*amqp.connect('amqp://localhost', function(err, conn) {
    if(err) console.log(err);
    conn.createChannel(function(err, ch) {
      if(err) console.log(err);
      var queue = offerta[2];

      ch.assertExchange(queue, 'fanout', {durable: true});
      ch.publish(queue, '', new Buffer(offerta));
      console.log("Messaggio Inserito");
      console.log(offerta);        //Questo dovrà essere mandato come notifica agli utenti che si iscriveranno ad una determinata categoria
      global_notifica = offerta; 
    });

   // setTimeout(function() { conn.close();}, 500);
  });*/
  var connection = amqp.createConnection({host: 'localhost'});
  connection.on('ready', function(){
		var messageToSend = new Array();
		messageToSend = offerta;
		var queueToSendTo = offerta[2];
		connection.publish(queueToSendTo, messageToSend);
		console.log("Sent message: "+ messageToSend);
		count++;
		//takeMessage(offerta,global_array,global_num);
		if(offerta[2] == "Legislatori, Imprenditori e Alta Dirigenza") takeMessage_L(offerta,array_leg,num_leg);
		else if(offerta[2] == "Professioni Intellettuali, Scientifiche e di elevata specializzazione") takeMessage_P(offerta,array_scie,num_scie);
		else if(offerta[2] == "Professioni Tecniche") takeMessage_T(offerta,array_tec,num_tec);
		else if(offerta[2] == "Professioni esecutive nel lavoro d'ufficio") takeMessage_U(offerta,array_uff,num_uff);
		else if(offerta[2] == "Professioni Qualificate nelle attività commerciali e nei servizi") takeMessage_S(offerta,array_comm,num_comm);
		else if(offerta[2] == "Artigiani, Operai Specializzati e Agricoltori") takeMessage_A(offerta,array_art,num_art);
		else if(offerta[2] == "Conduttori di impianti, Operai di macchinari fissi e mobili e Conducenti di veicoli") takeMessage_C(offerta,array_cond,num_cond);
		else if(offerta[2] == "Professioni non qualificate") takeMessage_N(offerta,array_nq,num_nq);
		else if(offerta[2] == "Forze Armate") takeMessage_F(offerta,array_forze,num_forze);
		else takeMessage_altro(offerta,array_altro,num_altro);
	});
}

app.post('/sottoscriviCategoria', function(req,res){
  global_category = req.body.categoria;
  res.render('sceltaCategoria', {categoria : global_category});
});

app.get('/visualizzaAnnuncioConCategoria',function(req,res){
  var matrice= new Array();
  var i;
  for(i=0;i<5;i++){
    matrice[i]=new Array();
  }
  var colonne= 0;
  var righe= 0;
  myFirebaseRef.child('offerte')
  .limitToLast(5)
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  		childsnap.forEach(function(campi){
  		  matrice[colonne][righe]= campi.val();
  		  righe+=1;
  		});
  	
  		righe=0;
  		if(colonne==4){
  		  //stampaMatrice(matrice);
  		  res.render('visualizzaAnnuncioConCategoria',{name : name, surname : surname, Img : picture,
  		                                  categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  		                                  categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                  categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                  categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6],
  		                                  categoria5 : matrice[4][0] , citta5 : matrice[4][1], email5 : matrice[4][2] , provincia5 : matrice[4][3] , testo5 : matrice[4][4], titolo5 : matrice[4][5] , username5 : matrice[4][6]
  		  });
  		}
  		colonne++;
  	});        
    //console.log("finito figlio"); //controllo
  });
  //console.log("finito get");  //controllo
  
  //Iscrizione alla categoria effettuata. Il client si mette in attesa di notifiche
  /*var connection = amqp.createConnection({host: 'localhost'});

  var queueToReceiveFrom = global_category;
  var message;
  connection.on('ready', function(){
		connection.queue(queueToReceiveFrom, {autoDelete: false}, function(queue){
			queue.subscribe(function(messageReceived){
				message = messageReceived;
				console.log("**"+message);
			});
		});
	});
	*/
});

app.get('/visualizzaAnnuncioConCategoria2',function(req,res){
  global_num = 0;
  var matrice= new Array();
  var i;
  for(i=0;i<5;i++){
    matrice[i]=new Array();
  }
  var colonne= 0;
  var righe= 0;
  myFirebaseRef.child('offerte')
  .limitToLast(5)
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  		childsnap.forEach(function(campi){
  		  matrice[colonne][righe]= campi.val();
  		  righe+=1;
  		});
  	
  		righe=0;
  		if(colonne==4){
  		  //stampaMatrice(matrice);
  		  res.render('visualizzaAnnuncioConCategoria',{name : name, surname : surname, Img : picture,
  		                                  categoria1 : matrice[0][0] , citta1 : matrice[0][1], email1 : matrice[0][2] , provincia1 : matrice[0][3] , testo1 : matrice[0][4], titolo1 : matrice[0][5] , username1 : matrice[0][6],
  		                                  categoria2 : matrice[1][0] , citta2 : matrice[1][1], email2 : matrice[1][2] , provincia2 : matrice[1][3] , testo2 : matrice[1][4], titolo2 : matrice[1][5] , username2 : matrice[1][6],  
  		                                  categoria3 : matrice[2][0] , citta3 : matrice[2][1], email3 : matrice[2][2] , provincia3 : matrice[2][3] , testo3 : matrice[2][4], titolo3 : matrice[2][5] , username3 : matrice[2][6],
  		                                  categoria4 : matrice[3][0] , citta4 : matrice[3][1], email4 : matrice[3][2] , provincia4 : matrice[3][3] , testo4 : matrice[3][4], titolo4 : matrice[3][5] , username4 : matrice[3][6],
  		                                  categoria5 : matrice[4][0] , citta5 : matrice[4][1], email5 : matrice[4][2] , provincia5 : matrice[4][3] , testo5 : matrice[4][4], titolo5 : matrice[4][5] , username5 : matrice[4][6]
  		  });
  		}
  		colonne++;
  	});        
    //console.log("finito figlio"); //controllo
  });
  //console.log("finito get");  //controllo
  
  //Iscrizione alla categoria effettuata. Il client si mette in attesa di notifiche
  /*var connection = amqp.createConnection({host: 'localhost'});

  var queueToReceiveFrom = global_category;
  var message;
  connection.on('ready', function(){
		connection.queue(queueToReceiveFrom, {autoDelete: false}, function(queue){
			queue.subscribe(function(messageReceived){
				message = messageReceived;
				console.log("**"+message);
			});
		});
	});
	*/
});

app.get('/visualizzaNotificaPerCategoria', function(req,res){
  if(global_category == "Legislatori, Imprenditori e Alta Dirigenza") {
    if(num_leg == 0) {
    res.render('noNotifiche', {categoria : global_category});
    }
    global_array=array_leg;
    global_num = num_leg;
  }
  else if(global_category == "Professioni Intellettuali, Scientifiche e di elevata specializzazione") {
    if(num_scie == 0) {
    res.render('noNotifiche', {categoria : global_category});
    }
    global_array=array_scie;
    global_num = num_scie;
  }
  else if(global_category == "Professioni Tecniche") {
    if(num_tec == 0) {
    res.render('noNotifiche', {categoria : global_category});
    }
    global_array=array_tec;
    global_num = num_tec;
  }
  else if(global_category == "Professioni esecutive nel lavoro d'ufficio") {
    if(num_uff == 0) {
    res.render('noNotifiche', {categoria : global_category});
    }
    global_array=array_uff;
    global_num = num_uff;
  }
  else if(global_category == "Professioni Qualificate nelle attività commerciali e nei servizi") {
    if(num_comm == 0) {
    res.render('noNotifiche', {categoria : global_category});
    }
    global_array=array_comm;
    global_num = num_comm;
  }
  else if(global_category == "Artigiani, Operai Specializzati e Agricoltori") {
    if(num_art == 0) {
    res.render('noNotifiche', {categoria : global_category});
    }
    global_array=array_art;
    global_num = num_art;
  }
  else if(global_category == "Conduttori di impianti, Operai di macchinari fissi e mobili e Conducenti di veicoli") {
    if(num_cond == 0) {
    res.render('noNotifiche', {categoria : global_category});
    }
    global_array=array_cond;
    global_num = num_cond;
  }
  else if(global_category == "Professioni non qualificate") {
    if(num_nq == 0) {
    res.render('noNotifiche', {categoria : global_category});
    }
    global_array=array_nq;
    global_num = num_nq;
  }
  else if(global_category == "Forze Armate") {
    if(num_forze == 0) {
    res.render('noNotifiche', {categoria : global_category});
    }
    global_array=array_forze;
    global_num = num_forze;
  }
  else {
    if(num_altro == 0) {
    res.render('noNotifiche', {categoria : global_category});
    }
    global_array=array_altro;
    global_num = num_altro;
  }
  
  var connection = amqp.createConnection({host: 'localhost'});
  //console.log(global_category);
  //console.log(global_num);
  //console.log(global_array);
  var queueToReceiveFrom = global_category;
  connection.on('ready', function(){
		connection.queue(queueToReceiveFrom, {autoDelete: false}, function(queue){
		  queue.subscribe(function(messageReceived){
		    res.render('visualizzaNotificaPerCategoria', {array : global_array, num : global_num, name : name, surname : surname, Img : picture});
			});
		});
	});
});

/*function takeMessage(message,array,num) {
  //var limit = 5;
  var i;
  for(i=0;i<7;i++) {
    global_array[num][i] = message[i];
  }
  global_num++;
}*/

function takeMessage_L(message,array,num) {
  //var limit = 5;
  var i;
  for(i=0;i<7;i++) {
    array_leg[num][i] = message[i];
  }
  num_leg++;
}

function takeMessage_P(message,array,num) {
  //var limit = 5;
  var i;
  for(i=0;i<7;i++) {
    array_scie[num][i] = message[i];
  }
  num_scie++;
}

function takeMessage_T(message,array,num) {
  //var limit = 5;
  var i;
  for(i=0;i<7;i++) {
    array_tec[num][i] = message[i];
  }
  num_tec++;
}

function takeMessage_U(message,array,num) {
  //var limit = 5;
  var i;
  for(i=0;i<7;i++) {
    array_uff[num][i] = message[i];
  }
  num_uff++;
}

function takeMessage_S(message,array,num) {
  //var limit = 5;
  var i;
  for(i=0;i<7;i++) {
    array_comm[num][i] = message[i];
  }
  num_comm++;
}

function takeMessage_A(message,array,num) {
  //var limit = 5;
  var i;
  for(i=0;i<7;i++) {
    array_art[num][i] = message[i];
  }
  num_art++;
}

function takeMessage_C(message,array,num) {
  //var limit = 5;
  var i;
  for(i=0;i<7;i++) {
    array_cond[num][i] = message[i];
  }
  num_cond++;
}

function takeMessage_N(message,array,num) {
  //var limit = 5;
  var i;
  for(i=0;i<7;i++) {
    array_nq[num][i] = message[i];
  }
  num_nq++;
}

function takeMessage_F(message,array,num) {
  //var limit = 5;
  var i;
  for(i=0;i<7;i++) {
    array_forze[num][i] = message[i];
  }
  num_forze++;
}

function takeMessage_altro(message,array,num) {
  //var limit = 5;
  var i;
  for(i=0;i<7;i++) {
    array_altro[num][i] = message[i];
  }
  num_altro++;
}

app.post('/inserisciOffertaConCategoria', function(req, res) {			//inserimento offerta di lavoro
    
    
    
    var titolo = req.body.titolo;
    var testo = req.body.testo;
    var categoria = req.body.categoria;
    var nome = name + " " + surname; // ho cambiuato qui
    var email = req.body.email;
    var citta =req.body.citta;
    var provincia =req.body.provincia;
    
      
    
    
    var off = new offerta(titolo, testo, categoria, nome, email, citta, provincia);
    
    var post_id = myFirebaseRef.child("offerte").push(off);
    key = post_id.key();
    res.render('inseritoConCategoria', {key : key });
   
    var notifica = new Array(titolo, testo, categoria, nome, email, citta, provincia);
    notification(notifica);
   
    console.log("post received: %s %s %s %s %s %s %s",titolo, testo, categoria, nome, email, citta, provincia, post_id.key());
    
});

app.get('/reset', function(req,res) {
  var i;
  if(global_category == "Legislatori, Imprenditori e Alta Dirigenza") {
    num_leg = 0;
    for(i=0;i<7;i++) {
      array_leg[i] = [];
    }
  }
  else if(global_category == "Professioni Intellettuali, Scientifiche e di elevata specializzazione") {
    num_scie = 0;
    for(i=0;i<7;i++) {
      array_scie[i] = [];
    }
  }
  else if(global_category == "Professioni Tecniche") {
    num_tec = 0;
    for(i=0;i<7;i++) {
      array_tec[i] = [];
    }
  }
  else if(global_category == "Professioni esecutive nel lavoro d'ufficio") {
    num_uff = 0;
    for(i=0;i<7;i++) {
      array_uff[i] = [];
    }
  }
  else if(global_category == "Professioni Qualificate nelle attività commerciali e nei servizi") {
    num_comm = 0;
    for(i=0;i<7;i++) {
      array_comm[i] = [];
    }
  }
  else if(global_category == "Artigiani, Operai Specializzati e Agricoltori") {
    num_art = 0;
    for(i=0;i<7;i++) {
      array_art[i] = [];
    }
  }
  else if(global_category == "Conduttori di impianti, Operai di macchinari fissi e mobili e Conducenti di veicoli") {
    num_cond = 0;
    for(i=0;i<7;i++) {
      array_cond[i] = [];
    }
  }
  else if(global_category == "Professioni non qualificate") {
    num_nq = 0;
    for(i=0;i<7;i++) {
      array_nq[i] = [];
    }
  }
  else if(global_category == "Forze Armate") {
    num_forze = 0;
    for(i=0;i<7;i++) {
      array_forze[i] = [];
    }
  }
  else {
    num_altro = 0;
    for(i=0;i<7;i++) {
      array_altro[i] = [];
    }
  }
  
  res.redirect('/visualizzaAnnuncioConCategoria');
});




//        ------------------------------JSON--------------------------
app.get('/api/cercaCitta', function(req, res){
  
  var citta = req.body.citta;
  myFirebaseRef.child('offerte')
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  	  var data = childsnap.exportVal();
  	  if(data.citta == citta){
  	      /*var result = {
			      result: 'success',
		    	  message: data
		    };
		    res.json(result);*/
		    send_success(res, {message : data});
  	  }
  	});
  });
});


app.get('/api/cercaProvincia', function(req, res){
  
  var provincia = req.body.provincia;
  myFirebaseRef.child('offerte')
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  	  var data = childsnap.exportVal();
  	  if(data.provincia == provincia){
  	    var result = {
			   result: 'success',
		     message: data
		    };
		    res.json(result);
  	  }
  	});
  });
});


app.get('/api/cercaUtente', function(req, res){
  var utente = name + " " + surname;
  myFirebaseRef.child('offerte')
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  	  var data = childsnap.exportVal();
  	  if(data.utente == utente){
  	    var result = {
			    result: 'success',
		    	message: data
		    };
		    res.json(result);
  	  }
  	});
  });
});


app.get('/api/cercaTitolo', function(req, res){
  var titolo = req.body.titolo;
  myFirebaseRef.child('offerte')
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  	  var data = childsnap.exportVal();
  	  if(data.titolo == titolo){
  	    var result = {
			    result: 'success',
		    	message: data
		    };
		    res.json(result);
  	  }
  	});
  });
});


app.get('/api/cercaCategoria', function(req, res){
  var categoria = req.body.categoria;
  myFirebaseRef.child('offerte')
  .once('value', function(snap){
  	snap.forEach(function(childsnap){
  	  var data = childsnap.exportVal();
  	  if(data.categoria == categoria){
  	    var result = {
			    result: 'success',
		    	message: data
		    };
		    res.json(result);
  	  }
  	});
  });
});


app.post('/api/inserisciOfferta', function(req, res) {
    var titolo = req.body.titolo;
    var testo = req.body.testo;
    var categoria = req.body.categoria;
    var nome = name + " " + surname; // ho cambiuato qui
    var email = req.body.email;
    var citta =req.body.citta;
    var provincia =req.body.provincia;
    
    var off = new offerta(titolo, testo, categoria, nome, email, citta, provincia);
    
    var post_id = myFirebaseRef.child("offerte").push(off);
    key = post_id.key();
   
    var notifica = new Array(titolo, testo, categoria, nome, email, citta, provincia);
    //riempi_array(global_array,notifica);
    notification(notifica);
   
    console.log("post received: %s %s %s %s %s %s %s",titolo, testo, categoria, nome, email, citta, provincia, post_id.key());
    var result = {
			    result: 'success',
		    	key: key,
		    	offerta: off
    };
		    res.json(result);
});


app.post('/api/cancella', function(req,res){
  var chiave= req.param('chiave');
  var fireCanc=new  Firebase("https://progetto-reti.firebaseio.com/offerte/" + chiave);
  var onComplete = function(error) {
  if (error) {
    console.log('Synchronization failed');
    var result = {
			    result: 'Annuncio non cancellato',
		    	message: 'Errore su DB'
		    };
		    res.json(result);
  } else {
    console.log('Synchronization succeeded');
    var result = {
			    result: 'success',
		    	message: chiave
		    };
		    res.json(result);
  }
  };
  fireCanc.remove(onComplete);
});

app.post('/api/sottoscriviCategoria', function(req,res){
  global_category = req.body.categoria;
  var result = {
    result : 'success',
    category : global_category
  };
  res.json(result);
});

app.get('/api/visualizzaNotificaPerCategoria', function(req,res){
  if(global_array[0].length == 0) {
    res.render('noNotifiche', {categoria : global_array[2]});
  }
  var connection = amqp.createConnection({host: 'localhost'});
  
  var not_matrix = new Array(5);
  var i;
  for(i=0;i<5;i++) {
    not_matrix[i] = new Array(7);
  }
  
  var queueToReceiveFrom = global_category;
  connection.on('ready', function(){
		connection.queue(queueToReceiveFrom, {autoDelete: false}, function(queue){
		  queue.subscribe(function(messageReceived){
		    var result = {
		      result : 'success',
		      array : global_array,
		      num : global_num,
		      name : name,
		      surname : surname
		    };
		    res.json(result);
			});
		});
	});
});

app.post('/api/inserisciOffertaConCategoria', function(req, res) {			//inserimento offerta di lavoro

    var titolo = req.body.titolo;
    var testo = req.body.testo;
    var categoria = req.body.categoria;
    var nome = name + " " + surname; // ho cambiuato qui
    var email = req.body.email;
    var citta =req.body.citta;
    var provincia =req.body.provincia;
    
    var off = new offerta(titolo, testo, categoria, nome, email, citta, provincia);
    
    var post_id = myFirebaseRef.child("offerte").push(off);
    key = post_id.key();
   
    var notifica = new Array(titolo, testo, categoria, nome, email, citta, provincia);
    notification(notifica);
   
    console.log("post received: %s %s %s %s %s %s %s",titolo, testo, categoria, nome, email, citta, provincia, post_id.key());
    
    var result = {
			    result: 'success',
		    	key: key,
		    	offerta: off
    };
		res.json(result);
});


// Lascio qualche funzione ausiliaria così evitiamo di riscrive troppe volte stesse cose

function send_success(res, data) {
  res.writeHead(200, {"Content-Type" : "application/json"});
  var output = {error : null, data: data};
  res.end(JSON.stringify(output) + "\n");
}

function send_failure(res, code, err){
  var code = (err.code) ? err.code : err.name;
  res.writeHead(code, {"Content-Type" : "application/json"});
  res.end(JSON.stringify({error: code, message: err.message}) + "\n");
}
