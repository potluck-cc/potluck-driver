import gql from "graphql-tag";

export default gql`
  query listOrders($nextToken: String, $date: String, $status: String) {
    listOrders(
      nextToken: $nextToken
      filter: {
        date: { eq: $date }
        status: { eq: $status }
        driver: { notContains: "-" }
        delivery: { eq: true }
      }
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
