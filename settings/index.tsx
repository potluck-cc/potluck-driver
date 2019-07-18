import React, {
  memo,
  ReactElement,
  useState,
  useContext,
  useEffect
} from "react";

import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";
import { Avatar, Text } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";

import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import Constants from "expo-constants";

import { Storage, Auth } from "aws-amplify";

import { appsyncFetch, OperationType } from "@potluckmarket/ella";
import client from "../client";
import UpdateDriver from "../mutations/UpdateDriver";

import AppContext from "../AppContext";

import { retrieveData } from "../storage";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function Settings({ navigation: { navigate } }: Props): ReactElement {
  const appContext: import("../AppContext").AppContextInterface = useContext(
    AppContext
  );

  const [performingStorageOperation, setPerformingStorageOperation] = useState(
    false
  );
  const [recentlyUploadedImage, setRecentlyUploadedImage] = useState(null);

  const [verificationDetails, setVerificationDetails] = useState({
    handlerLicenseVerified: false,
    driverDocumentationProvided: false
  });

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const handlerLicenseVerified = await retrieveData("handlerLicenseVerified");

    const driverDocumentationProvided = await retrieveData(
      "driverDocumentationProvided"
    );

    if (handlerLicenseVerified) {
      setVerificationDetails(currentState => ({
        ...currentState,
        handlerLicenseVerified: handlerLicenseVerified === "true" ? true : false
      }));
    }

    if (driverDocumentationProvided) {
      setVerificationDetails(currentState => ({
        ...currentState,
        driverDocumentationProvided:
          driverDocumentationProvided === "true" ? true : false
      }));
    }
  }

  async function getCameraPermissions(): Promise<string> {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      return status;
    }
  }

  async function pickImage(): Promise<void> {
    setPerformingStorageOperation(true);

    const status = await getCameraPermissions();
    if (status !== "granted") {
      setPerformingStorageOperation(false);
      return Alert.alert(
        "You need provide access to your camera roll in order to upload an image!"
      );
    } else {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0,
        exif: true,
        base64: true
      });

      if (!pickerResult.cancelled) {
        const imageName = pickerResult.uri.replace(/^.*[\\\/]/, "");
        const access = { level: "public", contentType: "image/jpeg" };
        const imageData = await fetch(pickerResult.uri);
        const blobData = await imageData.blob();

        await Storage.put(imageName, blobData, access);

        const newAvatar = `https://s3.amazonaws.com/potluckdriver-userfiles-mobilehub-596578573/public/${imageName}`;

        await appsyncFetch({
          client,
          operationType: OperationType.mutation,
          document: UpdateDriver,
          variables: {
            id: appContext.driver.id,
            avatar: newAvatar
          }
        });

        setRecentlyUploadedImage(newAvatar);
      }
    }
    setPerformingStorageOperation(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={() => pickImage()}>
          {performingStorageOperation ? (
            <ActivityIndicator size="large" />
          ) : (
            <Avatar
              source={{
                uri: recentlyUploadedImage
                  ? recentlyUploadedImage
                  : appContext.driver.avatar
                  ? appContext.driver.avatar
                  : "https://picsum.photos/200"
              }}
              size={"giant"}
            />
          )}
        </TouchableOpacity>

        <Text style={styles.driverName} category="h4">
          {`${appContext.driver.firstname || ""} ${appContext.driver.lastname ||
            ""}`}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.singleActionContainer}
          onPress={() => navigate("CompletedOrders")}
        >
          <Icon name="receipt" type="material-community" />
          <Text style={styles.actionText} category="s1">
            Completed Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleActionContainer}
          onPress={() => navigate("HandlerLicenseScanner")}
        >
          <Icon
            name={
              verificationDetails.handlerLicenseVerified
                ? "checkbox-marked"
                : "checkbox-blank-outline"
            }
            type="material-community"
          />
          <Text style={styles.actionText} category="s1">
            Handler License
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleActionContainer}
          onPress={() => navigate("DrivingDocuments")}
        >
          <Icon
            name={
              verificationDetails.driverDocumentationProvided
                ? "checkbox-marked"
                : "checkbox-blank-outline"
            }
            type="material-community"
          />
          <Text style={styles.actionText} category="s1">
            Driver Documentation
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleActionContainer}
          onPress={(): void => {
            navigate("ForgotPassword");
          }}
        >
          <Icon name="lock-reset" type="material-community" />
          <Text style={styles.actionText} category="s1">
            Change Password
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleActionContainer}
          onPress={(): void => {
            navigate("ChangeUsername");
          }}
        >
          <Icon name="cellphone-settings" type="material-community" />
          <Text style={styles.actionText} category="s1">
            Change Phone Number
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.singleActionContainer}
          onPress={async (): Promise<void> => {
            await Auth.signOut();
            await navigate("Auth");
          }}
        >
          <Icon name="logout" type="material-community" />
          <Text style={styles.actionText} category="s1">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1E1D"
  },
  avatarContainer: {
    paddingTop: 50,
    alignItems: "center"
  },
  driverName: {
    color: "white",
    paddingTop: 20
  },
  companyName: {
    color: "white",
    paddingTop: 5
  },
  actionsContainer: {
    marginTop: 20
  },
  singleActionContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 8,
    backgroundColor: "rgba(243, 156, 18, .8)",
    borderRadius: 5
  },
  actionText: {
    color: "black",
    textAlign: "left",
    paddingLeft: 5
  }
});

export default memo(Settings);
