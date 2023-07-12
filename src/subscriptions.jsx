import { gql, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";

const query_us = gql`
  subscription turns {
    turnsList(in: { limit: 100 }) {
      operationType
      turns {
        id
      }
    }
  }
`;

const query_them = gql`
  subscription {
    numberIncremented
  }
`;

export function Subscriptions({ useFailing }) {
  const { data, error, loading } = useSubscription(
    useFailing ? query_us : query_them
  );

  const [subEvents, setSubEvents] = useState([]);

  useEffect(() => {
    setSubEvents((old) => [...old, data]);
  }, [data]);
  console.log("data", data);

  return (
    <>
      <h3>Subscriptions</h3>
      {loading && <p>Loading...</p>}
      {error ? (
        <SubscriptionError />
      ) : (
        <>
          <h4>Response: </h4>
          <code>
            <pre>{JSON.stringify(subEvents, undefined, 2)}</pre>
          </code>
        </>
      )}
    </>
  );
}

function SubscriptionError() {
  return (
    <>
      <p>Error :(</p>
      <p>
        The CodeSandbox serving our WebSocket API may be sleeping, please visit{" "}
        <a href="https://uifesi.sse.codesandbox.io/graphql" target="_blank">
          https://uifesi.sse.codesandbox.io/graphql
        </a>{" "}
        to wake it up.
      </p>
      <p>
        Once you see the{" "}
        <a
          href="https://www.apollographql.com/docs/graphos/explorer/explorer/"
          target="_blank"
        >
          Apollo Studio Explorer
        </a>{" "}
        IDE at the link above, you can refresh this page.
      </p>
    </>
  );
}
