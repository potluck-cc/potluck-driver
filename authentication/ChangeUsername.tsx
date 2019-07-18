import React, { useState, ReactElement, memo, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

import styles from "./defaultStyles";
import { Input, Button } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";

import { useAuth } from "@potluckmarket/ella";
import { Auth } from "aws-amplify";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

const DefaultState = {
  username: "",
  error: ""
};

function ChangeUsername({
  navigation: { navigate }
}: Props): ReactElement<Props> {
  const [state, setState] = useState(DefaultState);

  const [loading, { handleChangeAttribute }] = useAuth(Auth);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("../storage");

    const changeUsernameRequested = await retrieveData(
      "changeUsernameRequested"
    );

    if (changeUsernameRequested) {
      navigate("Confirm", {
        verifyAttribute: true
      });
    }
  }

  async function requestChangePhoneNumber(): Promise<void> {
    const { storeData } = await import("../storage");
    const user = await Auth.currentAuthenticatedUser();

    handleChangeAttribute(
      {
        attribute: "phone_number",
        updatedAttributeValue: state.username,
        user
      },
      async () => {
        await storeData("changeUsernameRequested", "true");
        navigate("Confirm", {
          verifyAttribute: true
        });
      },
      error =>
        setState(currentState => ({
          ...currentState,
          error: typeof error === "string" ? error : error.message
        }))
    );
  }

  return (
    <View style={styles.container}>
      <Input
        size="large"
        label="Current Phone Number"
        onChangeText={text =>
          setState(currentState => ({ ...currentState, username: text }))
        }
        style={styles.input}
        value={state.username}
        keyboardType="numeric"
        returnKeyType="done"
        icon={({ tintColor }) => {
          return (
            <Icon
              name="cellphone"
              type="material-community"
              color={state.error ? "red" : tintColor}
              size={30}
            />
          );
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button
          onPress={() => requestChangePhoneNumber()}
          style={styles.btn}
          activeOpacity={0.5}
        >
          REQUEST PHONE NUMBER CHANGE
        </Button>
      )}
    </View>
  );
}

export default memo(ChangeUsername);
