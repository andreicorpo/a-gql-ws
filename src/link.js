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
  url: "ws://localhost:8091/query",
};

const them = {
  url: "ws://localhost:4000/graphql",
};

class WebSocketLink extends ApolloLink {
  client;

  constructor(options) {
    super();
    this.client = createClient(options);
  }

  request(operation) {
    console.log("op", operation);
    return new Observable((sink) => {
      console.log("sink", sink);
      return this.client.subscribe(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: (err) => {
            if (err instanceof Error) {
              return sink.error(err);
            }

            if (err instanceof CloseEvent) {
              return sink.error(
                // reason will be available on clean closes
                new Error(
                  `Socket closed with event ${err.code} ${err.reason || ""}`
                )
              );
            }

            return sink.error(
              new Error(err.map(({ message }) => message).join(", "))
            );
          },
        }
      );
    });
  }
}

const wsLink = new WebSocketLink({
  ...us,
  lazy: true,
});

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
export const link = middlewareLink.concat(
  ApolloLink.split(
    (operation) => operation.query.definitions.some(definitionIsSubscription),
    wsLink,
    staticDataLink
  )
);
