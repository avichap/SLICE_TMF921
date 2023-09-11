'use strict';
const $rdf = require('rdflib');
const RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const RDFS = $rdf.Namespace("http://www.w3.org/2000/01/rdf-schema#");
const IDAN = $rdf.Namespace("http://www.example.org/IDAN3#");
const ICM = $rdf.Namespace("http://tio.models.tmforum.org/tio/v3.2.0/IntentCommonModel#");
const CEM = $rdf.Namespace("http://tio.labs.tmforum.org/tio/v1.0.0/CatalystExtensionModel#");
const MET = $rdf.Namespace("http://www.sdo2.org/TelecomMetrics/Version_1.0#");
const T = $rdf.Namespace("http://www.w3.org/2006/time#");
const IMO = $rdf.Namespace("http://tio.models.tmforum.org/tio/v3.2.0/IntentManagmentOntology#");
const LOGI = $rdf.Namespace("http://tio.models.tmforum.org/tio/v3.2.0/LogicalOperators#");
const QUAN = $rdf.Namespace("http://tio.models.tmforum.org/tio/v3.2.0/QuantityOntology#");
const LOG = $rdf.Namespace("http://tio.models.tmforum.org/tio/v2.0.0/LogicalOperators#");

function get_uri_short_name(obj) {
  var split_obj = obj.substring(obj.indexOf('#')+1)
  return split_obj
}

function objective_object(intent,expectation,objective,evaluation) {
  return {
    intent: get_uri_short_name(intent),
    expectation: get_uri_short_name(expectation),
    objective: get_uri_short_name(objective),
    evaluation: evaluation,
    KPI: "transport",
    state: "ACCEPTED",
    objectiveType: "keep"
  }
}

function value_object(objective,value,intent,expectation) {
  return {
    objective: get_uri_short_name(objective),
    value: value,
    intent: intent,
    expectation: get_uri_short_name(expectation)
  }
}
function objectives(store,exp,intent) {
  var objective_array = []  
  if (intent.indexOf('S1')>0) {
    objective_array.push(...S1_objectives(store,exp,intent))
  } else if (intent.indexOf('R1_3')>0){
    objective_array.push(...R13_objectives(store,exp,intent))    
  } else if (intent.indexOf('R2_3')>0){
    objective_array.push(...R13_objectives(store,exp,intent))    
  } else if (intent.indexOf('R3_3')>0){
    objective_array.push(...R13_objectives(store,exp,intent))    
  } else if (intent.indexOf('R1_1')>0){
    objective_array.push(...R11_objectives(store,exp,intent))    
  } else if (intent.indexOf('R2_1')>0){
    objective_array.push(...R11_objectives(store,exp,intent))    
  } else if (intent.indexOf('R3_1')>0){
    objective_array.push(...R11_objectives(store,exp,intent))    
  }
  return objective_array
}

function S1_objectives(store,exp,intent) {
  var objective_array = []  
  var objectives = store.each(exp,LOGI("allOf"),undefined);

  objectives.forEach(obj => {
    var obj1s = store.statementsMatching(obj,RDFS("member"),undefined)
    obj1s.forEach(obj1 => {
      var obj2s = store.statementsMatching(obj1.object,undefined,undefined);
      obj2s.forEach(obj2 => {
        try {
          if (obj2.subject.value.indexOf("IDAN")>0) {
            var obj3 = store.statementsMatching(store.statementsMatching(obj2.object,undefined,undefined)[0].object,undefined,undefined);
              
            var obj_obj = objective_object(intent,exp.value,obj2.predicate.value,obj3[0].object.value+ ' '+ obj3[1].object.value.replace(/'/g,''))
            objective_array.push(obj_obj)
          }

        }  catch (err) {
//          console.log(err)
         }
      })
    });
  })
  return  objective_array
}

function R13_objectives(store,exp,intent) {
  var objective_array = []  
  var objectives = store.each(exp,LOGI("allOf"),undefined);

  objectives.forEach(obj => {
    var obj1s = store.statementsMatching(obj,RDFS("member"),undefined)
    obj1s.forEach(obj1 => {
      var obj2s = store.statementsMatching(obj1.object,undefined,undefined);
      obj2s.forEach(obj2 => {
        try {
          if (obj2.predicate.value.indexOf("security")>0) {           
            var obj_obj = objective_object(intent,exp.value,obj2.predicate.value,get_uri_short_name(obj2.object.value))
            objective_array.push(obj_obj)
          } else if (obj2.predicate.value.indexOf("computing")>0) {
            var name = get_uri_short_name(store.statementsMatching(obj2.object,undefined,undefined)[0].predicate.value);
            var obj3s = store.statementsMatching(store.statementsMatching(obj2.object,undefined,undefined)[0].object,undefined,undefined);;
            var obj_obj = []
            obj3s.forEach(obj3 => {
              if (get_uri_short_name(obj3.predicate.value)=="value")
                var pred = name
              else
                var pred = name + ' '+get_uri_short_name(obj3.predicate.value)
              var obj_obj_obj = objective_object(intent,exp.value,pred,obj3.object.value)
              obj_obj.push(obj_obj_obj)
            })
            objective_array.push(...obj_obj)
          } else if (obj2.predicate.value.indexOf("AccessMode")>0) {
            var obj3 = store.statementsMatching(obj2.object,undefined,undefined);
            var obj_obj
            if (obj3[1]!= undefined)            
              obj_obj = objective_object(intent,exp.value,obj2.predicate.value,get_uri_short_name(obj3[0].object.value)+ ' '+ get_uri_short_name(obj3[1].object.value.replace(/'/g,'')))
            else
              obj_obj = objective_object(intent,exp.value,obj2.predicate.value,get_uri_short_name(obj3[0].object.value))
            
            objective_array.push(obj_obj)
          } else if (obj2.predicate.value.indexOf("IDAN")>0) {
            var obj3 = store.statementsMatching(store.statementsMatching(obj2.object,undefined,undefined)[0].object,undefined,undefined);;
            var obj_obj = objective_object(intent,exp.value,obj2.predicate.value,obj3[0].object.value+ ' '+ obj3[1].object.value.replace(/'/g,''))
            objective_array.push(obj_obj)
          }

        }  catch (err) {
//          console.log(err)
         }
      })
    });
  })
  return  objective_array
}
function R11_objectives(store,exp,intent) {
  var objective_array = []  
  var objectives = store.each(exp,LOGI("allOf"),undefined);

  objectives.forEach(obj => {
    var obj1s = store.statementsMatching(obj,RDFS("member"),undefined)
    obj1s.forEach(obj1 => {
      var obj2s = store.statementsMatching(obj1.object,undefined,undefined);
      obj2s.forEach(obj2 => {
        try {

          if (obj2.predicate.value.indexOf("Quantity")>0) {
            var name = get_uri_short_name(store.statementsMatching(obj2.object,undefined,undefined)[0].predicate.value);
            var obj3 = store.statementsMatching(store.statementsMatching(obj2.object,undefined,undefined)[0].object,undefined,undefined);;
            var obj_obj = objective_object(intent,exp.value,name +  ' (Utility)',obj3[0].object.value +' '+obj3[1].object.value.replace(/'/g,''))
            objective_array.push(obj_obj)
          }

        }  catch (err) {
//          console.log(err)
         }
      })
    });
  })
  return  objective_array
}

function S1_values(store,report,intent) {
  var value_array = []  
  var expectationReport = store.each(report,ICM("hasExpectationReport"),undefined);

  expectationReport.forEach(obj => {
    var exp = store.statementsMatching(obj,ICM("about"),undefined)
    var obj1s = store.statementsMatching(obj,ICM("resultFrom"),undefined)
    obj1s.forEach(obj1 => {
      var obj2s = store.statementsMatching(store.statementsMatching(obj1.object,ICM("observed"),undefined)[0].object,undefined,undefined);
      obj2s.forEach(obj2 => {
        try {
            var obj_obj = value_object(obj2.predicate.value,obj2.object.value,intent,exp[0].object.value)
            value_array.push(obj_obj)

        }  catch (err) {
          console.log(err)
         }
      })
    });
  })
  return  value_array
}

function R13_values(store,report,intent) {
  var value_array = []  
  var expectationReport = store.each(report,ICM("hasExpectationReport"),undefined);

  expectationReport.forEach(obj => {
    var exp = store.statementsMatching(obj,ICM("about"),undefined)
    var obj1s = store.statementsMatching(obj,ICM("resultFrom"),undefined)
    obj1s.forEach(obj1 => {
      var obj2s = store.statementsMatching(store.statementsMatching(obj1.object,ICM("observed"),undefined)[0].object,undefined,undefined);
      obj2s.forEach(obj2 => {
        try {
            var obj_obj = value_object(obj2.predicate.value,get_uri_short_name(obj2.object.value).replace(/'/g,''),intent,exp[0].object.value)
            value_array.push(obj_obj)

        }  catch (err) {
          console.log(err)
         }
      })
    });
  })
  return  value_array
}

function R11_values(store,report,intent) {
  var value_array = []  
  var expectationReport = store.each(report,LOG("resultFrom"),undefined);

  expectationReport.forEach(obj => {
    var exp = store.statementsMatching(obj,ICM("about"),undefined)
    var obj1s = store.statementsMatching(obj,ICM("resultFrom"),undefined)
    obj1s.forEach(obj1 => {
      var obj2s = store.statementsMatching(store.statementsMatching(obj1.object,ICM("observed"),undefined)[0].object,undefined,undefined);
      obj2s.forEach(obj2 => {
        try {
            var obj_obj = value_object(obj2.predicate.value+  ' (Utility)',obj2.object.value,intent,exp[0].object.value)
            value_array.push(obj_obj)

        }  catch (err) {
          console.log(err)
         }
      })
    });
  })
  return  value_array
}

function values(store,report,intent) {
  var objective_array = []  
  if (intent.indexOf('S1')>0) {
    objective_array.push(...S1_values(store,report,intent))
  } else if (intent.indexOf('R1_3')>0){
    objective_array.push(...R13_values(store,report,intent))    
  } else if (intent.indexOf('R2_3')>0){
    objective_array.push(...R13_values(store,report,intent))    
  } else if (intent.indexOf('R3_3')>0){
    objective_array.push(...R13_values(store,report,intent))    
  } else if (intent.indexOf('R1_1')>0){
    objective_array.push(...R11_values(store,report,intent))    
  } else if (intent.indexOf('R2_1')>0){
    objective_array.push(...R11_values(store,report,intent))    
  } else if (intent.indexOf('R3_1')>0){
    objective_array.push(...R11_values(store,report,intent))    
  }
  return objective_array
}

module.exports = { 
    objectives,
    values
   };