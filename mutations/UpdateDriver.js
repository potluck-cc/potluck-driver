import gql from "graphql-tag";

export default gql`
  mutation UpdateDriver(
    $id: ID!
    $firstname: String
    $lastname: String
    $dob: String
    $licenseNumber: String
    $licenseIssueDate: String
    $licenseExpires: String
    $city: String
    $state: String
    $street: String
    $currentLocation: AWSJSON
    $avatar: AWSURL
    $cognitoUsername: String
    $phone: AWSPhone
  ) {
    updateDriver(
      input: {
        id: $id
        currentLocation: $currentLocation
        avatar: $avatar
        firstname: $firstname
        lastname: $lastname
        dob: $dob
        licenseNumber: $licenseNumber
        licenseIssueDate: $licenseIssueDate
        licenseExpires: $licenseExpires
        city: $city
        state: $state
        street: $street
        currentLocation: $currentLocation
        avatar: $avatar
        cognitoUsername: $cognitoUsername
        phone: $phone
      }
    ) {
      id
    }
  }
`;
