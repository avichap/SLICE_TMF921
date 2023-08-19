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

var spec = null;
var swaggerDoc = null;

const EXPRESSION = "expression";
var graphDBEndpoint = null;
var graphDBContext = null;
//////////////////////////////////////////////////////
// Functions returns the expressionLanguage         //
// property from theintent request                  //  
//////////////////////////////////////////////////////
function postPythonRI(url,id,expression) {
    var conf = readConf();
    console.log('XXX: In 23 '+conf.pythonServer);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
         if (this.readyState == 4 && this.status == 200) {
             //do nothing for now
             null;
             //alert(this.responseText);
         }
    };
    xhttp.open("POST", conf.pythonServer + url, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.setRequestHeader("accept", "application/json");
    var payload = {
      expression: expression,
      id: id
    }  
    payload = JSON.stringify(payload); 
    
    
    xhttp.send(payload);
 

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





module.exports = { 
  postPythonRI,
  deletePythonRI
				   			 };
