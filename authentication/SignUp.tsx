import React, { useState, ReactElement, useEffect } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";

import styles from "./defaultStyles";
import { Input, Button, Text } from "react-native-ui-kitten";
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
  password: "",
  error: "",
  hidePassword: true
};

function SignUp({ navigation: { navigate } }: Props): ReactElement<Props> {
  const [loading, { handleSignUp }] = useAuth(Auth);

  const [state, setState] = useState(DefaultState);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("../storage");
    const signedUp = await retrieveData("signedUp");

    if (signedUp) {
      navigate("Confirm");
    }
  }

  function handleError(error): void {
    if (error.includes("username")) {
      setState(currentState => ({
        ...currentState,
        error: "You must use a valid phone number."
      }));
    } else if (error.includes("phone_number")) {
      setState(currentState => ({
        ...currentState,
        error: "You must use a valid phone number."
      }));
    } else {
      setState(currentState => ({ ...currentState, error }));
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

      <Input
        size="large"
        label="Password"
        onChangeText={text =>
          setState(currentState => ({ ...currentState, password: text }))
        }
        secureTextEntry={state.hidePassword}
        style={styles.input}
        value={state.password}
        icon={({ tintColor }) => (
          <TouchableOpacity
            onPress={() =>
              setState(currentState => ({
                ...currentState,
                hidePassword: !currentState.hidePassword
              }))
            }
          >
            <Icon
              name={state.hidePassword ? "eye-off" : "eye"}
              type="material-community"
              color={state.error ? "red" : tintColor}
              size={25}
            />
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button
          onPress={() =>
            handleSignUp(
              {
                username: handlePhoneNumber(state.username),
                password: state.password
              },
              async () => {
                const { storeData } = await import("../storage");
                await storeData("signedUp", "true");
                await storeData("username", state.username);
                navigate("Confirm");
              },
              error =>
                handleError(typeof error === "string" ? error : error.message)
            )
          }
          style={styles.btn}
          activeOpacity={0.5}
        >
          SIGN UP
        </Button>
      )}

      <Text style={styles.errorText}>{state.error}</Text>

      <TouchableOpacity onPress={() => navigate("SignIn")}>
        <Text>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

export default SignUp;
