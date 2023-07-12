/*** LINK ***/
import { graphql, print } from "graphql";
import { ApolloLink, Observable } from "@apollo/client";
import { createClient } from "graphql-ws";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { schema } from "./schema.js";

function delay(wait) {
  return new Promise((resolve) => setTimeout(resolve, wait));
}

const staticDataLink = new ApolloLink((operation) => {
  return new Observable(async (observer) => {
    const { query, operationName, variables } = operation;
    await delay(300);
    try {
      const result = await graphql({
        schema,
        source: print(query),
        variableValues: variables,
        operationName,
      });
      observer.next(result);
      observer.complete();
    } catch (err) {
      observer.error(err);
    }
  });
});

const url = "wss://5wggt3.sse.codesandbox.io/graphql";

const us = {
  url: "wss://aa-test-gql.airportlabs.com/query",
};

const them = {
  url: "wss://uifesi.sse.codesandbox.io/graphql",
};

const wsLink = (useFailing) =>
  new GraphQLWsLink(
    createClient({
      ...(useFailing ? us : them),
    })
  );

const definitionIsSubscription = (d) => {
  return d.kind === "OperationDefinition" && d.operation === "subscription";
};

const middlewareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    // Intercept the subscription response here
    console.log("Subscription response:", response);
    // You can modify the response or perform additional actions

    return response;
  });
});

// Use directional composition in order to customize the terminating link
// based on operation type: a WebSocket for subscriptions and our own
// custom ApolloLink for everything else.
// For more information, see: https://www.apollographql.com/docs/react/api/link/introduction/#directional-composition
export const link = (useFailing) =>
  middlewareLink.concat(
    ApolloLink.split(
      (operation) => operation.query.definitions.some(definitionIsSubscription),
      wsLink(useFailing),
      staticDataLink
    )
  );
