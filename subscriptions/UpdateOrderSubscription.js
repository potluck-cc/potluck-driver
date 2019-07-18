import gql from "graphql-tag";

export default gql`
  subscription UpdateOrder($id: ID) {
    onUpdateOrder(id: $id) {
      id
    }
  }
`;
