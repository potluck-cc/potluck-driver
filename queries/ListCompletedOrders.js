import gql from "graphql-tag";

export default gql`
  query listOrders($nextToken: String, $driver: String) {
    listOrders(
      nextToken: $nextToken
      filter: { driver: { eq: $driver }, deliveryStatus: { eq: "complete" } }
    ) {
      items {
        id
        total
        date
        status
        time
        subtotal
        tax
        discount
        totalDisplayValue
        subtotalDisplayValue
        taxDisplayValue
        deliveryStatus
        store {
          id
          name
          latitude
          longitude
        }
        user {
          id
          firstname
          lastname
          patientID
          phone
          street
          city
          state
        }
        products {
          product {
            name
          }
          productType
          quantity
          price
          isCannabisProduct
          option {
            amount
            weight
          }
        }
      }
      nextToken
    }
  }
`;
