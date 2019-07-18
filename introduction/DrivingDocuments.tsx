import React, { memo, ReactElement } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Input } from "react-native-ui-kitten";

function DrivingDocuments(): ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        In order to be compliant with New Jersey State Law, we have to collect
        information on your driver's license and your vehicle insurance.
      </Text>

      <Text style={styles.text}>
        For the purpose of this demo -- the fields are disabled. Please, click
        "Done".
      </Text>

      <View style={styles.formContainer}>
        <Input label="First Name" disabled />
        <Input label="Last Name" disabled />
        <Input label="Email" disabled />
        <Input label="License Expiration Date" disabled />
        <Input label="Insurance Expiration Date" disabled />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: "#222B45"
  },
  text: {
    textAlign: "center",
    marginBottom: 5
  },
  formContainer: {
    padding: 10,
    width: "100%"
  }
});

export default memo(DrivingDocuments);
