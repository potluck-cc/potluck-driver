import gql from "graphql-tag";

export default gql`
  mutation CreateDriver($phone: AWSPhone) {
    createDriver(input: { phone: $phone }) {
      id
    }
  }
`;
