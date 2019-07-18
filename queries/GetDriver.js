import gql from "graphql-tag";

export default gql`
  query GetDriver($phone: String) {
    listDrivers(filter: { phone: { eq: $phone } }) {
      items {
        id
        firstname
        lastname
        dob
        licenseNumber
        licenseIssueDate
        licenseExpires
        city
        state
        street
        avatar
      }
    }
  }
`;
