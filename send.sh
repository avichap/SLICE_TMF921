curl --location 'http://localhost:8080/tmf-api/intent/v4/intent' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data-raw '{
  "statusChangeDate": "2022-07-23T04:56:07.000+00:00",
  "expression": {
    "iri": "http://tio.models.tmforum.org/tio/v3.2.0/IntentCommonModel/",
    "@baseType": "Expression",
    "@type": "TurtleExpression",
    "expressionLanguage": "Turtle",
    "expressionValue": "@prefix icm:  <http://tio.models.tmforum.org/tio/v3.2.0/IntentCommonModel#> .\n@prefix imo:  <http://tio.models.tmforum.org/tio/v3.2.0/IntentManagmentOntology#> .\n@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .\n@prefix idan: <http://www.example.org/IDAN3#> .\n@prefix t:    <http://www.w3.org/2006/time#> .\n@prefix logi:  <http://tio.models.tmforum.org/tio/v3.2.0/LogicalOperators#> .\n@prefix quan: <http://tio.models.tmforum.org/tio/v3.2.0/QuantityOntology#> .\n@prefix set:  <http://tio.models.tmforum.org/tio/v3.2.0/SetOperators#> .\n@prefix fun:  <http://tio.models.tmforum.org/tio/v3.2.0/FunctionOntology#> .\n@prefix ui: <http://www..example.org/ui#> .\n@prefix mf: <http://www..example.org/mf#> .\n@prefix cem: <http://tio.labs.tmforum.org/tio/v1.0.0/CatalystExtensionModel#> .\n@prefix   iv: <http://tio.models.tmforum.org/tio/v3.2.0/IntentValidity#> .\n#intent\nidan:IS3_Power\n  a icm:Intent ;\n  cem:layer idan:service ;\n imo:intentOwner idan:Service ;\n rdfs:comment \"'\''Intent for maintaining a desirable energy consumption profile of 10W per user'\''\" ;\n  icm:hasExpectation idan:ES3_energy_consumption_expectation,\n                        idan:ES3_reporting_expectation\n     .\nidan:ES3_energy_consumption_expectation\n  a icm:EnergyConsumptionExpectation ;\n    icm:energyProfile idan:ES3_energy_profile ;\n    icm:target idan:TS3 ;\n.\nidan:ES3_energy_profile\n  a icm:EnergyProfile ;\n  icm:observation [ icm:latestValue 10 ;\n                    icm:unit idan:EC1_unit ;\n                  ] ;\n.\nidan:EC1_unit\n  a icm:Parameter ;\n  icm:unitDescription \"'\''Watt/User'\''\" ;\n  icm:unitType idan:Power ;\n.\n# targets\nidan:TS3\n  a icm:Target ;\n  icm:allOf [ rdfs:member idan:RanDomain;\n               rdfs:member idan:TransportDomain;\n               rdfs:member idan:CoreDomain;\n               rdfs:member idan:EdgeDomain]\n.\n# reporting\n# event for time-based reporting. Triggereing every 5 minutes\nidan:EventS3\n  a rdfs:Class ;\n  rdfs:subClassOf imo:Event ;\n  logi:if [ t:after [imo:timeOfLastEvent [rdfs:member idan:EventS3 ;\n                                              rdfs:member idan:IS3_Power ]]  ,\n                        [t:hasDuration idan:5M ] ;\n                t:before [ t:hasBeginning imo:Now ] ;\n         ] ;\n  imo:eventFor idan:IS3_Power\n.\nidan:ES3_reporting_expectation\n  a icm:ReportingExpectation ;\n  icm:target idan:IS3_Power  ;\n  icm:reportDestination [ rdfs:member idan:Operations ] ;\n  icm:reportTriggers [ rdfs:member imo:IntentRejected ; \n                       rdfs:member imo:IntentAccepted ;\n                       rdfs:memner imo:IntentDegrades ;\n                       rdfs:member imo:IntentComplies ;\n                       rdfs:member imo:IntentRemoval ;\n                       rdfs:member idan:EventS3 ] \n.",
    "@schemaLocation": "https://mycsp.com:8080/tmf-api/schema/Common/TurtleExpression.schema.json"
  },
  "lifecycleStatus": "Created",
  "@baseType": "Intent",
  "validFor": {
    "startDateTime": "2022-04-12T23:20:50.52Z",
    "endDateTime": "2023-04-12T23:20:50.52Z"
  },
  "@type": "Intent",
  "lastUpdate": "2022-01-23T04:56:07.000+00:00",
  "name": "IS3_Power",
  "description": "IS3_Power",
  "creationDate": "2022-01-23T04:56:07.000+00:00",
  "@schemaLocation": "https://mycsp.com:8080/tmf-api/schema/Common/TurtleExpression.schema.json",
  "version": "1"
}'
