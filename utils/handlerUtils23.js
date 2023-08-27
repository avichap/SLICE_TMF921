//////////////////////////////////////////////////////
/*              Huawei IRC                          */
/*              demo                     */
/* HandlerUtils:                                    */
/* Functions to support the intent handler          */
//////////////////////////////////////////////////////

'use strict';

var fs = require('fs'),
    path = require('path'),
    jsyaml = require('js-yaml');

const {TError, TErrorEnum, sendError} = require('./errorUtils');
const swaggerUtils = require('./swaggerUtils');
const mongoUtils = require('./mongoUtils');
const intentService = require('../service/IntentService');
const $rdf = require('rdflib');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const uuid = require('uuid');
const notificationUtils = require('../utils/notificationUtils');

const RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
const IDAN = $rdf.Namespace("http://www.example.org/IDAN3#");
const ICM = $rdf.Namespace("http://tio.models.tmforum.org/tio/v3.2.0/IntentCommonModel#");
const CEM = $rdf.Namespace("http://tio.labs.tmforum.org/tio/v1.0.0/CatalystExtensionModel#");
const MET = $rdf.Namespace("http://www.sdo2.org/TelecomMetrics/Version_1.0#");
const T = $rdf.Namespace("http://www.w3.org/2006/time#");
const IMO = $rdf.Namespace("http://tio.models.tmforum.org/tio/v3.2.0/IntentManagmentOntology#");

const persist =require('./persistgql');

var spec = null;
var swaggerDoc = null;

const EXPRESSION = "expression";
var graphDBEndpoint = null;
var graphDBContext = null;
//////////////////////////////////////////////////////
// Functions returns the expressionLanguage         //
// property from theintent request                  //  
//////////////////////////////////////////////////////
function postIntentReportCreationEvent(event) {
    const url = "http://localhost:8092/tmf-api/intent/v4/listener/intentReportCreateEvent"
    console.log('XXX: In 23 '+url);
    
    post(url,event)
}

function postACTN(name,data,id,parent_id) {
  const url_huawei = "http://10.220.239.74:18181/restconf/data"
  const url_other = "http://10.220.239.74:28181/restconf/data"

  
    try {
      var payload = JSON.parse(data)
    } catch (err) {
      console.log('err '+ err)
    }
    
    post(url_huawei+"/ietf-te:te/tunnels",payload.expression.expressionValue.huawei_tunnel);
    post(url_huawei+"/ietf-eth-tran-service:etht-svc",payload.expression.expressionValue.huawei_service,'PATCH');
    post(url_other+"/ietf-te:te/tunnels",payload.expression.expressionValue.other_tunnel)
    post(url_huawei+"/ietf-eth-tran-service:etht-svc",payload.expression.expressionValue.other_service,'PATCH');
  
  //save in graphql
    process_ACTN(name,id,parent_id)
  
}
async function post(url,body,method) {
    console.log ('Post message to: '+url)

  const response = await fetch(url, {
  method: method?method:'POST',
  headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error('Http response was not OK for '+url);
    }
    console.log("POST Order sent successfully!");
  })
  .catch((error) => {
    console.error('POST failed with error:', error);
  });
};

function deletePythonRI(req,id) {
  var conf = readConf();
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
       if (this.readyState == 4 && this.status == 200) {
           //do nothing for now
           null;
           //alert(this.responseText);
       }
  };
  var url=req.originalUrl;
  
  if (id) {
     var a=url.slice(0,url.indexOf('/v4/intent/')+11)
     url=a+id
  }

  xhttp.open("DELETE", conf.pythonServer + url, true);
  xhttp.setRequestHeader("Content-type", "application/json");
  xhttp.setRequestHeader("accept", "application/json");
  
  
  xhttp.send();


};

function readConf() {
  var conf;
  try {
      conf = require('../config.json');
      console.log("Loaded config");
  } catch (e) {
      console.log(e)
  }
  return conf;
}


async function process_intents (expression,id,version) {
  var uri = 'http://www.example.org/IDAN3#';
  var mimeType = 'text/turtle';

  var store = $rdf.graph();

 //create rdf object
 try {
   $rdf.parse(expression, store, uri, mimeType,function (){
     var intents = prepare_intents (store,id)
     var expectations = prepare_expectations (store)
     var hierarchy = prepare_hierarchy (store,version)
     
     insert_intents(intents,expectations,hierarchy,version)
 
  })
 }
 catch (err) {
  console.log(err)
 }
}

async function insert_intents (intents,expectations,hierarchy,version) {
  const response = await persist.processIntents (intents)
  .then ((result) => persist.processExpectations (expectations))
  .then ((result) => persist.queryHierarchy (version))
  .then ((result) => persist.hierarchyResults(result))  
  .then ((parent) => persist.processHierarchy(parent,hierarchy)) 

}
function process_ACTN (name,id,version) {
 //create rdf object
 try {
    var intents = {
      intent: name,
      intent_id: id,
      description: "ACTN Intent",
      intentType: "resource",
      domain: "Transport"
    }

    persist.processIntents (intents)
    .then ((result) => persist.queryHierarchy (version))
    .then ((result) => persist.hierarchyResults(result))  
    .then ((parent) => persist.processHierarchy(parent,name))  
 }
 catch (err) {
  console.log(err)
 }
}

function get_uri_short_name(obj) {
    var split_obj = obj.substring(obj.indexOf('#')+1)
    return split_obj
}

function prepare_intents(store,id) {
  var intent = store.each(undefined, RDF('type'), ICM('Intent'));
  var comment = store.each(intent[0], RDFS('comment'),undefined);
  var layer = store.each(intent[0], CEM('layer'),undefined);
  var owner = store.each(intent[0], IMO('intentOwner'),undefined);
  
  var intent_obj = {
    intent: get_uri_short_name(intent[0].value),
    intent_id: id,
    description: comment[0]?comment.value:"",
    intentType: layer?get_uri_short_name(layer[0].value):"",
    domain: owner?get_uri_short_name(owner[0].value):""
  }

  console.log(intent_obj)
  return intent_obj
}

function prepare_expectations (store) {
  var intent = store.each(undefined, RDF('type'), ICM('Intent'));
  var expectations = store.each(intent[0], ICM('hasExpectation'),undefined);
  
  var exp_array = []
  expectations.forEach(exp => {
    var type = store.each(exp, RDF('type'),undefined);
    var target = store.each(exp, ICM('target'),undefined);
    var comment = store.each(exp, RDFS('comment'),undefined);

    var exp_obj = {
      intent: get_uri_short_name(intent[0].value),
      expectation: get_uri_short_name(exp.value),
      expectationType: type?get_uri_short_name(type[0].value):"",
      description: comment[0]?comment.value:"",
      target: target?get_uri_short_name(target[0].value):""
    }
    exp_array.push(exp_obj)
  })
  
  return exp_array

};

function prepare_hierarchy (store,child) {
  var intent = store.each(undefined, RDF('type'), ICM('Intent'));
  return get_uri_short_name(intent[0].value)
  
};

function process_reports (expression,intentid,id) {
  var uri = 'http://www.example.org/IDAN3#';
  var mimeType = 'text/turtle';

  var store = $rdf.graph();

 //create rdf object
 try {
   $rdf.parse(expression, store, uri, mimeType,function (){
     var reports = prepare_reports (store,id)

    persist.processReports (reports)
  })
 }
 catch (err) {
  console.log(err)
 }
}

function prepare_reports(store,id) {
  var report = store.each(undefined, RDF('type'), ICM('IntentReport'));
  var state = store.each(report[0], ICM('handlingState'),undefined);
  var intent = store.each(report[0], ICM('reportsAbout'),undefined);
  var seq = store.each(report[0], ICM('reportNumber'),undefined);
  
  var report_obj = {
    intentReport: get_uri_short_name(report[0].value),
    intentReport_id: id,
    state: state?get_uri_short_name(state[0].value):"",
    intent: intent?get_uri_short_name(intent[0].value):"",
    sequence: seq?seq[0].value:""
  }

  console.log(report_obj)
  return report_obj
}

function delete_intents (intent) {
  console.log("Deleting intent: "+intent)
  try {
    persist.deleteExpectations (intent)
    .then((result) => persist.deleteReports (intent))
    .then((result) => persist.deleteHierarchy (intent))
    .then((result) => persist.deleteIntents (intent))
  }  
 catch (err) {
  console.log(err)
 }
}

module.exports = { 
  process_intents,
  process_reports,
  delete_intents,
  postIntentReportCreationEvent,
  postACTN
 };
