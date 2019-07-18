import React, { useState, useEffect, memo, useContext } from "react";
import AppContext from "../AppContext";
import {
  View,
  Vibration,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Camera } from "expo-camera";

import { useLazyAppSyncQuery, OperationType } from "@potluckmarket/ella";
import client from "../client";
import CreateDriver from "../mutations/CreateDriver";
import UpdateDriver from "../mutations/UpdateDriver";

import { Text } from "react-native-ui-kitten";

const { width, height } = Dimensions.get("window");

const modalStyles = {
  height: height / 1.8
};

const DefaultState = {
  hasCameraPermission: null,
  type: Camera.Constants.Type.back,
  scannedCode: null,
  scannedItem: {
    type: null,
    data: null
  },
  isMessageModalOpen: false,
  messageModalMessage: ""
};

function Scanner() {
  const appContext: import("../AppContext").AppContextInterface = useContext(
    AppContext
  );

  const [state, setState] = useState(DefaultState);

  //   const [driver, loading, userOperation] = useLazyAppSyncQuery({
  //     client,
  //     document: appContext.userDBData ? UpdateDriver : CreateDriver,
  //     operationType: OperationType.mutation,
  //     handleError: () => {
  //       setState(currentState => ({
  //         ...currentState,
  //         errorMessage: "Something went wrong! Please try again!"
  //       }));
  //     }
  //   });

  useEffect(() => {
    initializeScannerScreen();
  }, []);

  //   useEffect(() => {
  //     if (state.isMessageModalOpen) {
  //       setState(currentState => ({
  //         ...currentState,
  //         isMessageModalOpen: false
  //       }));
  //     }

  //     if (driver && driver.createDriver && driver.createDriver.id) {
  //       goBack();
  //     }
  //   }, [driver]);

  function resetScanner() {
    setState(currentState => ({
      ...DefaultState,
      hasCameraPermission: currentState.hasCameraPermission
    }));
  }

  async function initializeScannerScreen() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    await setState(currentState => ({
      ...currentState,
      hasCameraPermission: status === "granted"
    }));
    await resetScanner();
  }

  function renderAlert(message) {
    setState(currentState => ({
      ...currentState,
      isMessageModalOpen: true,
      messageModalMessage: message
    }));
  }

  function parse8DigitDate(date) {
    // r/badcode
    const originalDateAsArray = date.split("");
    let parsedDateArray = [];

    originalDateAsArray.forEach((value, index) => {
      if (index === 1) {
        return parsedDateArray.push(`${value}/`);
      } else if (index === 3) {
        return parsedDateArray.push(`${value}/`);
      } else {
        return parsedDateArray.push(String(value));
      }
    });
    return parsedDateArray.join("");
  }

  function onBarCodeRead({ type, data }) {
    if (
      (type === state.scannedItem.type && data === state.scannedItem.data) ||
      data === null
    ) {
      return;
    }

    Vibration.vibrate();

    Alert.alert(
      "Thank You!",
      "Thanks for checking out the demo! Currently, we are waiting for the formation of the Cannabis Regulatory Commission in the state of New Jersey. This commission will be overseeing the NJMMP program and thus will be determing how the actual Handler Licenses are going to function. Once we can get our hands on one, we can build a functioning scanner around it."
    );
  }

  async function onSave() {
    return;
  }

  function renderScanner() {
    if (!state.hasCameraPermission) {
      return <ActivityIndicator size="large" />;
    } else if (state.scannedItem.data) {
      return <ActivityIndicator size="large" />;
    } else if (state.messageModalMessage.length) {
      return <ActivityIndicator size="large" />;
    } else {
      return (
        <BarCodeScanner
          onBarCodeScanned={onBarCodeRead}
          style={[StyleSheet.absoluteFill, { padding: 5 }]}
        />
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        In order to start delivering for Potluck Market, we'll need to verify
        that you have an active Medical Marijuana Handler License in the state
        of New Jersey.
      </Text>

      <Text style={styles.text}>
        Scan the barcode on the back of your New Jersey Medical Marijuana
        Handler License by focusing the camera.
      </Text>

      <View style={styles.barcodeScannerContainer}>{renderScanner()}</View>
    </View>
  );
}

export default memo(Scanner);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222B45",
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    textAlign: "center",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10
  },
  barcodeScannerContainer: {
    width: width / 1.2,
    height: 100,
    marginTop: 50,
    borderWidth: 1,
    borderColor: "red",
    justifyContent: "center"
  }
});
