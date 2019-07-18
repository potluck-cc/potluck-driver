import React, { useState, ReactElement, useEffect, memo } from "react";
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

function ForgotPassword({
  navigation: { navigate }
}: Props): ReactElement<Props> {
  const [state, setState] = useState(DefaultState);

  const [loading, { handleForgotPasswordRequest }] = useAuth(Auth);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("../storage");
    const username = await retrieveData("username");

    if (username) {
      setState(currentState => ({
        ...currentState,
        username: typeof username === "string" ? username : ""
      }));
    }
  }

  function handlePhoneNumber(phonenumber: string): string {
    if (phonenumber[0] === "+" && phonenumber[1] === "1") {
      return phonenumber;
    } else {
      return `+1${phonenumber}`;
    }
  }

  return (
    <View style={styles.container}>
      <Input
        size="large"
        label="Phone Number"
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
          onPress={() =>
            handleForgotPasswordRequest(
              {
                username: handlePhoneNumber(state.username)
              },
              async () => {
                const { storeData } = await import("../storage");
                await storeData("forgotPassword", "true");
                navigate("Confirm");
              },
              error =>
                setState(currentState => ({
                  ...currentState,
                  error: typeof error === "string" ? error : error.message
                }))
            )
          }
          style={styles.btn}
          activeOpacity={0.5}
        >
          REQUEST PASSWORD CHANGE
        </Button>
      )}
    </View>
  );
}

export default memo(ForgotPassword);
