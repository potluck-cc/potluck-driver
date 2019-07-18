import React, { useState, useEffect, ReactElement, memo } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import styles from "./defaultStyles";
import { Input, Button, Text } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";
import { useAuth } from "@potluckmarket/ella";
import { Auth } from "aws-amplify";
import client from "../client";
import CreateDriver from "../mutations/CreateDriver";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

const DefaultState = {
  username: "",
  password: "",
  code: "",
  error: "",
  forgotPassword: false,
  hidePassword: true
};

function Confirm({
  navigation: { navigate, goBack, getParam }
}: Props): ReactElement {
  const verifyAttribute = getParam("verifyAttribute", false);

  const [state, setState] = useState(DefaultState);

  const [
    loading,
    {
      handleConfirmAccount,
      handleResendConfirmationEmail,
      handleConfirmPasswordChange,
      handleVerifyChangeAttribute
    }
  ] = useAuth(Auth);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData } = await import("../storage");
    const username = await retrieveData("username");
    const forgotPassword = await retrieveData("forgotPassword");

    if (username) {
      setState(currentState => ({
        ...currentState,
        username: typeof username === "string" ? username : ""
      }));
    }

    if (forgotPassword) {
      setState(currentState => ({
        ...currentState,
        forgotPassword: forgotPassword === "true" ? true : false
      }));
    }
  }

  async function onSubmit(): Promise<void> {
    if (state.forgotPassword) {
      handleConfirmPasswordChange(
        {
          username: state.username,
          password: state.password,
          code: state.code
        },
        async () => {
          const { destroyData } = await import("../storage");
          await destroyData("forgotPassword");
          navigate("SignIn");
        },
        error =>
          setState(currentState => ({
            ...currentState,
            error: typeof error === "string" ? error : error.message
          }))
      );
    } else if (verifyAttribute) {
      handleVerifyChangeAttribute(
        {
          attribute: "phone_number",
          code: state.code
        },
        () => {
          navigate("SignIn");
        },
        error => {
          setState(currentState => ({
            ...currentState,
            error: typeof error === "string" ? error : error.message
          }));
        }
      );
    } else {
      handleConfirmAccount(
        {
          username: handlePhoneNumber(state.username),
          code: state.code,
          password: state.password
        },
        async () => {
          const { destroyData } = await import("../storage");
          const { appsyncFetch, OperationType } = await import(
            "@potluckmarket/ella"
          );

          await destroyData("signedUp");

          await appsyncFetch({
            client,
            operationType: OperationType.mutation,
            document: CreateDriver,
            variables: {
              phone: handlePhoneNumber(state.username)
            }
          });

          navigate("AppLoading");
        },
        error =>
          setState(currentState => ({
            ...currentState,
            error: typeof error === "string" ? error : error.message
          }))
      );
    }
  }

  async function cancelForgotPassword(): Promise<void> {
    const { destroyData } = await import("../storage");
    await destroyData("requestSent");
    goBack();
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
      {!verifyAttribute ? (
        <Input
          size="large"
          label="Phone Number"
          onChangeText={text =>
            setState(currentState => ({ ...currentState, username: text }))
          }
          style={styles.input}
          value={state.username}
          keyboardType="numeric"
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
      ) : null}

      {state.forgotPassword ? (
        <Input
          size="large"
          label="New Password"
          onChangeText={text =>
            setState(currentState => ({ ...currentState, password: text }))
          }
          style={styles.input}
          value={state.password}
          secureTextEntry={state.hidePassword}
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
      ) : null}

      <Input
        size="large"
        label="Code"
        onChangeText={text =>
          setState(currentState => ({ ...currentState, code: text }))
        }
        style={styles.input}
        value={state.code}
        keyboardType="numeric"
        returnKeyType="done"
        icon={({ tintColor }) => (
          <Icon
            name="numeric"
            type="material-community"
            color={state.error ? "red" : tintColor}
            size={30}
          />
        )}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button
          onPress={() => onSubmit()}
          style={styles.btn}
          activeOpacity={0.5}
        >
          CONFIRM
        </Button>
      )}

      <Text style={styles.errorText}>{state.error}</Text>

      {state.forgotPassword ? (
        <TouchableOpacity onPress={() => cancelForgotPassword()}>
          <Text>Cancel Forgot Password Request</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() =>
            handleResendConfirmationEmail(
              { username: handlePhoneNumber(state.username) },
              () => {},
              error =>
                setState(currentState => ({
                  ...currentState,
                  error: typeof error === "string" ? error : error.message
                }))
            )
          }
        >
          <Text>Resend Code</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigate("SignIn")}>
        <Text>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

export default memo(Confirm);
