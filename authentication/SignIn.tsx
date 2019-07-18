import React, { ReactElement, useState, useEffect, memo } from "react";
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

function SignIn({ navigation: { navigate } }: Props): ReactElement<Props> {
  const [state, setState] = useState(DefaultState);

  const [loading, { handleLogin }] = useAuth(Auth);

  function handleInputChange(target, value): void {
    setState(currentState => ({
      ...currentState,
      [target]: value
    }));
  }

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("../storage");
    const username = await retrieveData("username");
    if (username) {
      handleInputChange("username", username);
    }
  }

  function isEmail(username: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
  }

  function isPhoneNumber(username: string): boolean {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(
      username
    );
  }

  function determineUsernameType(username: string): string {
    if (isEmail(username)) {
      return "at";
    } else if (isPhoneNumber(username)) {
      return "cellphone";
    } else {
      return "alert-circle";
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
        onChangeText={text => handleInputChange("username", text)}
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

      <Input
        size="large"
        label="Password"
        onChangeText={text => handleInputChange("password", text)}
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
            handleLogin(
              {
                username: handlePhoneNumber(state.username),
                password: state.password
              },
              () => {
                navigate("AppLoading");
              },
              error => {
                if (typeof error === "string") {
                  handleInputChange("error", error);
                } else {
                  handleInputChange("error", error.message);
                }
              }
            )
          }
          style={styles.btn}
          activeOpacity={0.5}
        >
          SIGN IN
        </Button>
      )}

      <Text style={styles.errorText}>{state.error}</Text>

      <TouchableOpacity onPress={() => navigate("SignUp")}>
        <Text>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigate("ForgotPassword")}>
        <Text>Forgot Password</Text>
      </TouchableOpacity>
    </View>
  );
}

export default memo(SignIn);
