/**
 * Beware all the code plungers!
 * I wrote this code while drunk.
 */


var url  = require('url'),
  queryStr = require('query-string'),
  _ = require('underscore'),
  ZeroClipboard = require('./scripts/ZeroClipboard');

var rootUrl, utmSource, utmMedium, utmCampaign, suggUtmCampaign, utmContent, utmTerm, qsCount = 0;
var zcClient = new ZeroClipboard(document.getElementById("utm_code_button"));

zcClient.on("copy", function(){
  document.getElementById("utm_code_button").innerHTML = "Copied!";
});

var questions = [
  {
    "questionTag" : "URL_INPUT",
    "question"    : "Begin by entering a URL",
    "required"    : true,
    "input"       : "https://castleblack.com",
    "callback"    : function( input ){
      rootUrl = input;
    }
  },
  {
    "questionTag" : "PAID_CAMPAIGN",
    "dependsOn"  : "URL_INPUT",
    "remaining"  : "",
    "question"    : "Is the link a part of a paid advertising campaign?",
    "choices"     : ["Yes", "No"]
  },

  {
    "questionTag" : "AD_NETWORK",
    "dependsOn"   : "PAID_CAMPAIGN_YES",
    "question"    : "Which Ad Network will you be using?",
    "choices"     : ["Facebook Ads", "Twitter Ads", "YouTube Ads", "LinkedIn Ads", "Adwords", "Yahoo! Ads", "Bing Ads", "Other"],
    "callback"    : function( choice ){
      if( choice === "Facebook Ads" ) {
        utmSource = "facebook";
      } else if( choice === "Twitter Ads") {
        utmSource = "twitter";
      } else if( choice === "LinkedIn Ads") {
        utmSource = "linkedin";
      } else if( choice === "YouTube Ads") {
        utmSource = "youtube";
      } else if( choice === "Adwords" ) {
        utmSource = "adwords";
      } else if( choice === "Yahoo! Ads" ){
        utmSource = "yahoo";
      } else if( choice === "Bing Ads" ) {
        utmSource = "bing";
      }
    }
  },

  {
    "questionTag" : "AD_NETWORK_INPUT",
    "dependsOn"   : "AD_NETWORK_OTHER",
    "question"    : "Which Ad Network will you be using?",
    "input"       : "eg, Taboola",
    "callback"    : function( input ){
      utmSource = input.toLowerCase().replace(' ', '-');
    }
  },

  {
    "questionTag" : "CAMPAIGN_TYPE",
    "dependsOn"	  : ["AD_NETWORK", "AD_NETWORK_INPUT"],
    "question"    : "What kind of campaign is it?",
    "choices"     : ["CPC", "CPM", "CPA"],
    "callback" 		: function( choice ) {
      utmMedium = choice.toLowerCase();
    }
  },
  {
    "questionTag" : "RETARGETING_CAMPAIGN",
    "dependsOn"		: "CAMPAIGN_TYPE",
    "question"    : "Is it a retargeting campaign?",
    "choices"     : ["Yes", "No"],
    "callback" 		: function( choice ) {
      if( choice === "Yes" ){
        suggUtmCampaign = utmSource + "-retargeting";
      }
    }
  },

  {
    "questionTag" : "LINK_PLACE",
    "dependsOn" 	: "PAID_CAMPAIGN_NO",
    "question"    : "Where will this link be used on?",
    "choices"     : ["Social Media", "Your Website", "Email", "3rd Party Website"],
    "callback" 		: function( choice ) {
      if( choice === "Social Media" ){
        utmMedium = "social";
      } else if( choice === "Email" ){
        utmMedium = "email";
      } else if( utmMedium === undefined ){
        utmMedium = "referral";
      }
    }
  },

  {
    "questionTag" : "3RD_PARTY_WEBSITE",
    "dependsOn" 	: "LINK_PLACE_3RD_PARTY_WEBSITE",
    "description" : "Describe the site in one word",

    "question"    : "What is the website?" ,
    "input"     	: "What is the website?",
    "callback" 		: function( input ) {
      utmSource = input;
    }
  },

  {
    "questionTag" : "SOCIAL_MEDIA_SITE",
    "dependsOn"   : "LINK_PLACE_SOCIAL_MEDIA",
    "question"    : "Which Social Media site is it?"	,
    "choices"     : ["Facebook", "Twitter", "LinkedIn", "YouTube", "Reddit", "Other"],
    "callback" 		: function( choice ) {
        if( choice !== "Other" ) {
          utmSource = choice.toLowerCase().replace(' ', '-');
        }
    }
  },

  {
    "questionTag" : "SOCIAL_MEDIA_SITE_OTHER",
    "dependsOn" : "LINK_TYPE_SOCIAL_MEDIA_OTHER",
    "question"    : "Which Social Media site is it then?"	,
    "input"     : "eg, tumblr",
    "callback" 		: function( input ) {
      utmSource = input;
    }
  },

  {
    "questionTag" : "LINK_TYPE_EMAIL",
    "dependsOn" : "LINK_PLACE_EMAIL",

    "question"    : "What type of Email is it?",
    "choices"  : ["Newsletter", "Promotional", "Survey", "Reach Out"],

    "callback"	: function( choice ){
      utmSource = choice.replace(' ', '-').toLowerCase();
    }
  },
  {
    "questionTag" : "LINK_TYPE_WEBSITE",
    "dependsOn" : "LINK_PLACE_YOUR_WEBSITE",

    "description" : "",
    "question" : "What is the section of your website where link will be used?",
    "choices"  : ["Blog", "Case Study", "White Paper", "Banner", "Popup", "Video", "Other"],

    "callback"	: function( choice ){
      utmSource = choice.replace(' ', '-').toLowerCase();
    }
  },

  {
    "questionTag" : "WEBSITE",
    "dependsOn" : "LINK_TYPE_WEBSITE_OTHER",

    "question" : "What part of your website describes the link placement?",
    "input"			: "eg, team-page",

    "callback"	: function( input ){
      utmSource = input.replace(' ', '-').toLowerCase();
    }
  },
  {
    "questionTag" : "CAMPAIGN_NAME",
    "dependsOn" : ["LINK_TYPE_EMAIL", "SOCIAL_MEDIA_SITE", "SOCIAL_MEDIA_SITE_OTHER", "LINK_TYPE_WEBSITE", "WEBSITE", "RETARGETING_CAMPAIGN"],
    "question" : "What is your campaign name?",
    "description" : "Campaign name gives the link a context. It could be in terms of a specific stratergy or a section of website. For eg, <u>summer-sale</u>, <u>case-study-google</u>. \
      <br><br> Depending upon your requirements you can be very specific or avoid having a campaign name if you just want to measure broad levels of traffic sources",
    "input"  : function(){
      if( suggUtmCampaign ) {
        return  "eg, " + suggUtmCampaign;
      } else {
        return "eg, 50-off-sale";
      }
    },
    "callback": function( input ){
      utmCampaign = input;
    }
  },
  {
    "questionTag" : "DIFFERENT_LINKS",
    "dependsOn" : "CAMPAIGN_NAME",

    "description" : "On your blog / ad campaign, you may have two CTAs that lead to the same landing page. \
      You can identify the different links using seperate terms to track their performance.",
    "question" : "Are there different links that lead to the same page?",
    "choices"  : ["Yes", "No"]
  },
  {
    "questionTag" : "DIFFERENT_LINKS_DESCRIPTION",
    "question" : "Use a short term to describe the different link.",
    "dependsOn" : "DIFFERENT_LINKS_YES",
    "input" : "eg, navbar, top-image",
    "callback" : function( input ) {
      utmContent = input;
    }
  },
];


var currentQuestion = questions[0],
  questionDiv = document.getElementById('askQuestion');

function nano(template, data) {
  return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
    var keys = key.split("."), v = data[keys.shift()];
    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
    return (typeof v !== "undefined" && v !== null) ? v : "";
  });
}

function updateUrl() {
  var utmURL = url.parse(rootUrl, true);

  if ( utmSource )
    utmURL.query.utm_source = utmSource;

  if( utmMedium )
    utmURL.query.utm_medium = utmMedium;

  if( utmCampaign )
    utmURL.query.utm_campaign = utmCampaign;

  if( utmContent )
    utmURL.query.utm_content = utmContent;

  document.getElementById("utm_code").value = url.format( utmURL );
  document.getElementById("utm_code_button").innerHTML = "Copy";

}

function choose( radioElem ){
  var answerVal, nextQuestion;

  if( currentQuestion.callback ) {
    currentQuestion.callback( radioElem.value );
  }

  answerVal = currentQuestion.questionTag + "_" + radioElem.value.replace(" ", "_").toUpperCase();
  nextQuestion = _(questions).find(function(question){
    if( Array.isArray(question.dependsOn) )
      return question.dependsOn.indexOf(answerVal) !== -1;
    else
      return question.dependsOn === answerVal;
  });

  if( ! nextQuestion ) {
    nextQuestion = _(questions).find(function(question){
      if( Array.isArray(question.dependsOn) )
        return question.dependsOn.indexOf(currentQuestion.questionTag) !== -1;
      else
        return question.dependsOn === currentQuestion.questionTag;
    });
  }

  updateUrl();

  if( ! nextQuestion ) {
    questionDiv.innerHTML = "<p class='question'>Yay! Your UTM Parameters have been generated. <a href='/'>Build more</a>.</p> \
    <p> Found UTMBuilder Useful? Drag this URL to Bookmark Bar or use Ctrl + D to Bookmark this page. </p>";
    document.getElementById("next").remove();
    return;
  }

  currentQuestion = nextQuestion;

  askQuestion( currentQuestion, questionDiv );
}

function createInput( type, value ) {

  if( type === 'radio' ){
    return nano(
      "<label><input type='radio' name='choice' value='{choiceVal}'> {choiceVal}</label>",
      {
        choiceVal: value
      }
    );
  } else if( type === 'text') {

    return nano(
      "<input type='text' autofocus id='textInput' required='{requiredVal}' placeholder='{textVal}'>",
      {
        textVal: typeof value === "function" ? value() : value,
        requiredVal: value
      }
    );
  }
}

function renderChoices( choices, div ) {
  choices.forEach(function( choice ){
    div.innerHTML += createInput( 'radio', choice );
  });

  var radios = [].slice.call(document.getElementsByName('choice'));

  for( var i = 0; i < radios.length; i++ ) {
    radios[i].onclick = choose.bind(this, radios[i]);
  }

  document.getElementById("nextContainer").innerHTML = '';
}

function setNewStorageValue( textInput ) {
  var existingStorage = JSON.parse(localStorage.getItem( currentQuestion.questionTag ) || "[]");

  if( existingStorage.indexOf(textInput.value) === -1 ) {
    existingStorage.push(textInput.value);
  }
  localStorage.setItem( currentQuestion.questionTag, JSON.stringify(existingStorage) );
}

function renderInput( input, div ) {
  div.innerHTML += createInput( 'text', input.input);

  var textInput = document.getElementById("textInput");

  if( window.localStorage ) {
    jQuery(textInput).autocomplete({
        lookup: JSON.parse(localStorage.getItem( currentQuestion.questionTag ) || "[]")
    });
  }

  textInput.focus();
  textInput.onkeypress = function(e){
    if( e.which === 13 ) {
      setNewStorageValue(textInput);
      choose(textInput);
    }
  };
  document.getElementById("nextContainer").innerHTML = '<a id="next" class="button  float-right" style="margin-left: 15px;">Next</a>';
  document.getElementById("next").onclick = function(){
    setNewStorageValue( textInput );
    choose(textInput);
  };
}

function askQuestion( question, div) {
  qsCount += 1;

  div.innerHTML = '<p class="question">' + qsCount + ". " + question.question + '</p>';

  if( question.description )
    div.innerHTML += '<p class="description">' + question.description + '</p>';

  if( question.choices ) {
    renderChoices( question.choices, div);
  } else if( question.input ) {
    renderInput( question, div);
  }

}

askQuestion(currentQuestion, questionDiv);
