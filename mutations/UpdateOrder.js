import gql from "graphql-tag";

export default gql`
  mutation UpdateOrder(
    $orderID: ID!
    $driver: String
    $deliveryStatus: DeliveryStatus
  ) {
    updateOrder(
      input: { id: $orderID, driver: $driver, deliveryStatus: $deliveryStatus }
    ) {
      id
      deliveryStatus
      driver {
        id
      }
    }
  }
`;
