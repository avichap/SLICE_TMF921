const { ApolloClient, ApolloProvider, InMemoryCache, gql, useSubscription, useMutation } = require('@apollo/client');
const { HttpLink,createHttpLink } = require("apollo-link-http");
const {fetch} = require('apollo-env');

const grpurl = process.env.REACT_APP_GRAPHQL_ENGINE_URL!==undefined ? process.env.REACT_APP_GRAPHQL_ENGINE_URL:"10.220.239.74"

const httpLink = new HttpLink({
  fetch: fetch,
  uri: `http://${grpurl}:8080/v1/graphql`,
  headers: { 'x-hasura-admin-secret': "myadminsecretkey" },
  defaultHttpLink: false
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});


const INSERT_INTENT = gql`
  mutation insert_intents($intents: [intents_insert_input!]!) {
    insert_intents(objects: $intents) {
        returning {
            intent
            intent_id
            description
        }
    }
}`;

const INSERT_EXPECTATION = gql`
mutation insert_intent_expectations($expectations: [intentExpectations_insert_input!]!) {
  insert_intentExpectations(objects: $expectations) {
      returning {
          intent
          expectation
      }
  }
}`;

const INSERT_HIERARCHY = gql`
   mutation insert_intentsintents($intentsintents: [intentsintents_insert_input!]!) {
      insert_intentsintents(objects: $intentsintents) {
           returning {
               parentintent
               childintent
           }
       }
   }`;

const QUERY_INTENT = gql `
query getIntents($intent_id: String!) {
  intents(where: {intent_id: {_eq: $intent_id}}) {
    intent
    intent_id
  }
}
`
const INSERT_REPORT = gql`
mutation insert_intentReports($reports: [intentReports_insert_input!]!) {
  insert_intentReports(objects: $reports) {
      returning {
          intentReport
          intentReport_id
          description
      }
  }
  }
`

const DELETE_EXPECTATIONS = gql`
mutation deleteintentExpectations($intent:String!){
  delete_intentExpectations(where: {intent: {_eq: $intent}}){
      returning {
          expectation
      }
  }
}
`

const DELETE_INTENT = gql`
mutation deleteIntent($intent:String!){
  delete_intents_by_pk(intent:$intent){
      intent
  }
}
`

const DELETE_REPORTS = gql`
mutation deleteintentReports($intent:String!){
  delete_intentReports(where: {intent: {_eq: $intent}}){
      returning {
          intentReport
      }
  }
}`

const DELETE_HIERARCHY = gql`
mutation deleteintentsintents($intent:String!){
  delete_intentsintents(where: {parentintent: {_eq: $intent}}){
      returning {
          parentintent
      }
  }
}`

function processIntents (intents) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(
        client
        .mutate({
        mutation: INSERT_INTENT,
        variables: {intents}
      }))
    } catch (err) {
        console.log('error procesing intents:' + intents)      
        return reject(err)
    } 
  })
};

function processExpectations (expectations) {
  return new Promise(function (resolve, reject) {
    try {
        resolve(client.mutate({mutation: INSERT_EXPECTATION,variables: {expectations}}))
      } catch (err) {
        console.log('error procesing expectations:' + expectations)
        return reject(err)
    } 
  })
  
};
           
function queryHierarchy (intent_id) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(client.query({query: QUERY_INTENT,variables: {intent_id}}))
    } catch (err) {
      return reject (err)
    } 
  })
}

function hierarchyResults(result) {
  return new Promise(function (resolve, reject) {
    var res 
    console.log('Query susscesful: '+result)
    if (result.data.intents[0]!=undefined) res = result.data.intents[0].intent
    resolve(res)
  })  
}

function processHierarchy (parent,child) {
  return new Promise(function (resolve, reject) {
    try {
      if (parent != undefined) {
        var intentsintents = {
          parentintent: parent, 
          childintent: child
        }
      resolve (client.mutate({mutation: INSERT_HIERARCHY,variables: {intentsintents}}))
      }
    } catch (err) {
      console.log('error procesing hierarchy:' + parent + 'child '+ child)
      return reject(err)
    } 
  })
};

function processReports (reports) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(
        client
        .mutate({
        mutation: INSERT_REPORT,
        variables: {reports}
      }))
    } catch (err) {
      console.log('error procesing reports:' + reports)
      return reject(err)
    } 
  })
};
  
function deleteExpectations (intent) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(client.mutate({mutation: DELETE_EXPECTATIONS,variables: {intent}}))
    } catch (err) {
      console.log('error deleting expectations:' + intent)
      return reject (err)
    } 
  })
}

function deleteReports (intent) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(client.mutate({mutation: DELETE_REPORTS,variables: {intent}}))
    } catch (err) {
      console.log('error deleting reports:' + intent)
      return reject (err)
    } 
  })
}

function deleteHierarchy (intent) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(client.mutate({mutation: DELETE_HIERARCHY,variables: {intent}}))
    } catch (err) {
      console.log('error deleting hierarchy:' + intent)
      return reject (err)
    } 
  })
}

function deleteIntents (intent) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(client.mutate({mutation: DELETE_INTENT,variables: {intent}}))
    } catch (err) {
      console.log('error delete intent:' + intent)
      return reject (err)
    } 
  })
}
module.exports = { 
  processIntents,
  processExpectations,
  processHierarchy,
  queryHierarchy,
  hierarchyResults,
  processReports,
  deleteExpectations,
  deleteReports,
  deleteHierarchy,
  deleteIntents
};