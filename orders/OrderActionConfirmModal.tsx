import React, { memo, ReactElement } from "react";
import { View, StyleSheet } from "react-native";
import Modal from "react-native-modalbox";
import { Text, Button } from "react-native-ui-kitten";

type Props = {
  isOpen: boolean;
  message: string;
  hide: Function;
  onConfirm: Function;
};

function OrderActionConfirmModal({
  isOpen,
  message,
  hide,
  onConfirm
}: Props): ReactElement {
  return (
    <Modal
      isOpen={isOpen}
      style={styles.modal}
      onClosed={hide}
      backdrop={false}
    >
      <View style={styles.container}>
        <Text style={styles.text} category="h6">
          {message}
        </Text>
        <View style={styles.btnGroup}>
          <Button
            status="white"
            onPress={() => hide()}
            textStyle={{ color: "black" }}
          >
            Cancel
          </Button>
          <Button status="danger" onPress={() => onConfirm()}>
            Confirm
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    height: 250,
    width: 300
  },
  container: {
    flex: 1,
    marginTop: 5,
    backgroundColor: "#1C1E1D",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 10
  },
  text: {
    textAlign: "center"
  },
  btnGroup: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly"
  }
});

export default memo(OrderActionConfirmModal);
