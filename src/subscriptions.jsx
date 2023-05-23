import { gql, useMutation, useSubscription } from "@apollo/client";

const query_us = gql`
  subscription turns {
    turnsList(in: { limit: 50 }) {
      operationType
      turns {
        id
      }
    }
  }
`;

const query_them = gql`
  subscription {
    numberIncremented {
      turns {
        id
      }
      operationType
    }
  }
`;

const query_mut = gql`
  mutation Mutation {
    triggerEvent
  }
`;

export function Subscriptions() {
  const { data, error, loading } = useSubscription(query_us);
  const [mut] = useMutation(query_mut);
  console.log("data", data);

  return (
    <>
      <h3>Subscriptions</h3>
      <button
        onClick={() => {
          mut().then(
            (data) => console.log("mut data", data),
            (err) => console.error("mut er", err)
          );
        }}
      >
        Call
      </button>
      {loading && <p>Loading...</p>}
      {error ? (
        <SubscriptionError />
      ) : (
        <>
          <h4>Response: </h4>
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
