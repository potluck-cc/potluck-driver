import React, { memo, ReactElement } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-ui-kitten";

function Welcome(): ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.text} category="h2">
        Welcome to
      </Text>
      <Text style={styles.text} category="h1">
        Potluck Driver
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    textAlign: "center",
    marginBottom: 5
  }
});

export default memo(Welcome);
