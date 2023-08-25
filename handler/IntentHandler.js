//////////////////////////////////////////////////////
/*              Huawei IRC                          */
/*              Idan Catalyst                       */
/* IntentHandler:                                   */
/* Intent Handler creates and deletes the Knowledge */
/* objects                                          */
//////////////////////////////////////////////////////
'use strict';

const util = require('util');
const uuid = require('uuid');
const fs = require('fs');
const async = require('async');
const $rdf = require('rdflib')

const notificationUtils = require('../utils/notificationUtils');


const {TError, TErrorEnum, sendError} = require('../utils/errorUtils');
const handlerUtils = require('../utils/handlerUtils');
const handlerUtils23 = require('../utils/handlerUtils23');
const mongoUtils = require('../utils/mongoUtils');
const swaggerUtils = require('../utils/swaggerUtils');
const Intent = require('../controllers/Intent');

const serviceIntentHandler = require('../handler/ServiceIntentHandler');
const sendResource = process.env.SEND_RESOURCE_INTENT!==undefined ? process.env.SEND_RESOURCE_INTENT:true

// This function is called from the RI once the intent as been stored in MOngo
//it will extract the expression from the request body, parse the expresion into
//triples and then store these triples in the graphdb.
//It then reads a hardcode intent report and send this back to the listeners 
//using the RI HUB
exports.processIntent = function(req) {
//  handlerUtils.wait(120000);

  //extract expression
  const expression = handlerUtils.getExpression(req);

  //From expression extract triples and load the data in GraphDB 
  handlerUtils.extractTriplesandKG(expression,`insert`,'text/turtle','R3_1');
  
    /* 2023 XXXXXXXXXXXXX Huawei IRC - Start  XXXXXXXXXXXXXXXx*/
    //Call the python server 
//    handlerUtils23.postPythonRI(req.originalUrl,req.body.id,req.body);
   handlerUtils23.process_intents(expression,req.body.id,req.body.version)
/* 2023 XXXXXXXXXXXXX Huawei IRC - End  XXXXXXXXXXXXXXXx*/

  var filename;
  if (sendResource) {
    /// Test R31 process
  if (expression.indexOf("R3_1") >= 0) {

    // 1. Intent Accepted
    filename = 'R31R1_Intent_Accepted'
    handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
    console.log(`log: ${filename} sent`);
    
    // 2. Intent Degraded
    filename = 'R31R2_Intent_Compliant'
    handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
    console.log(`log: ${filename} sent`);

 }

if (expression.indexOf("R3_2") >= 0) {

  // 1. Intent Accepted
  filename = 'R32R1_Intent_Accepted'
  handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
  console.log(`log: ${filename} sent`);
  
  // 2. Intent Degraded
  filename = 'R32R2_Intent_Compliant'
  handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
  console.log(`log: ${filename} sent`);

}

if (expression.indexOf("R3_3") >= 0) {

  // 1. Intent Accepted
  filename = 'R33R1_Intent_Accepted'
  handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
  console.log(`log: ${filename} sent`);
  
  // 2. Intent Degraded
  filename = 'R33R2_Intent_Compliant'
  handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
  console.log(`log: ${filename} sent`);
  
  }

  if (expression.indexOf("R2_3") >= 0) {

    // 1. Intent Accepted
    filename = 'R23R1_Intent_Accepted'
    handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
    console.log(`log: ${filename} sent`);
    
    // 2. Intent Degraded
    filename = 'R23R2_Intent_Compliant'
    handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
    console.log(`log: ${filename} sent`);
  
  }
  
  if (expression.indexOf("R2_1") >= 0) {
  
    // 1. Intent Accepted
    filename = 'R21R1_Intent_Accepted'
    handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
    console.log(`log: ${filename} sent`);
    
    // 2. Intent Degraded
    filename = 'R21R2_Intent_Compliant'
    handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
    console.log(`log: ${filename} sent`);
  
  }
  
  if (expression.indexOf("R2_2") >= 0) {
  
  // 1. Intent Accepted
  filename = 'R22R1_Intent_Accepted'
  handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
  console.log(`log: ${filename} sent`);
  
  // 2. Intent Degraded
  filename = 'R22R2_Intent_Compliant'
  handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
  console.log(`log: ${filename} sent`);
  
  }
  if (expression.indexOf("R1_3") >= 0) {

    // 1. Intent Accepted
    filename = 'R13R1_Intent_Accepted'
    handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
    console.log(`log: ${filename} sent`);
    
    // 2. Intent Degraded
    filename = 'R13R2_Intent_Compliant'
    handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
    console.log(`log: ${filename} sent`);
  
  }
  
  if (expression.indexOf("R1_1") >= 0) {
  
    // 1. Intent Accepted
    filename = 'R11R1_Intent_Accepted'
    handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
    console.log(`log: ${filename} sent`);
    
    // 2. Intent Degraded
    filename = 'R11R2_Intent_Compliant'
    handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
    console.log(`log: ${filename} sent`);
  
  }
  
  if (expression.indexOf("R1_2") >= 0) {
  
  // 1. Intent Accepted
  filename = 'R12R1_Intent_Accepted'
  handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
  console.log(`log: ${filename} sent`);
  
  // 2. Intent Degraded
  filename = 'R12R2_Intent_Compliant'
  handlerUtils.sendIntentReport(filename, filename+'.ttl', req);
  console.log(`log: ${filename} sent`);
  
  }
    
}


};


// This function is called from the RI once the intent as been deleted from MOngo
//it reads the intent expression from mongo, parse the expresion into
//triples and then deletes these triples from the graphdb.
exports.deleteIntent = function(query,resourceType) {

  console.log('query.id: '+query.id)
  console.log('resourceType: '+resourceType)
 //reads intent from mongo and then deletes objects from KG.  All in one function as async
 handlerUtils.getIntentExpressionandDeleteKG(query,resourceType); 

};
exports.deleteIntentbyName = function(name,req,serviceIntent) {
  var query = mongoUtils.getMongoQuery(req);
  query.criteria.name = name
//  query = swaggerUtils.updateQueryServiceType(query, req,'name');
  var resourceType = 'Intent'
  console.log('name: '+name)
  console.log('resourceType: '+resourceType)
  mongoUtils.connect().then(db => {
  db.collection(resourceType)
  .find(query.criteria, query.options).toArray()
  .then(doc => {
    doc.forEach(x => {
      var query2 = {
        id: x.id
      };
      if (serviceIntent) {
         serviceIntentHandler.deleteIntentReports(x.id, 'IntentReport');
         serviceIntentHandler.deleteIntent(query2,'Intent');
      } else {
        this.deleteIntentReports(x.id, 'IntentReport');
        this.deleteIntent(query2,'Intent');
      }
/* 2023 XXXXXXXXXXXXX Huawei IRC - Start  XXXXXXXXXXXXXXXx*/
    //Call the python server 
//    handlerUtils23.deletePythonRI(req,x.id);
    handlerUtils23.delete_intents(name)
/* 2023 XXXXXXXXXXXXX Huawei IRC - End  XXXXXXXXXXXXXXXx*/
    })
  })
  .catch(error => {
  console.log("deleteIntent: error=" + error);
  });
  })
  .catch(error => {
  console.log("deleteIntent: error=" + error);
  });

};

// This function is called from the RI once the intentReport as been deleted from MOngo
//it reads the intentReport expression from mongo, parse the expresion into
//triples and then deletes these triples from the graphdb.
exports.deleteIntentReports = function(id,resourceType) {

  console.log('intentid: '+id)
  console.log('resourceType: '+resourceType)
 //reads intent from mongo and then deletes objects from KG.  All in one function as async
 handlerUtils.getIntentReportExpressionandDeleteKG(id,resourceType); 


};
