import React, { ReactElement, useEffect, memo } from "react";
import { View, ActivityIndicator } from "react-native";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function AppLoading({ navigation: { navigate } }: Props): ReactElement {
  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    try {
      const { retrieveData, destroyData } = await import("../storage");
      const { Auth } = await import("aws-amplify");

      // destroyData("introductionComplete");
      // Auth.signOut();

      const user = await Auth.currentAuthenticatedUser();
      const introductionComplete = await retrieveData("introductionComplete");
      if (user && user.attributes && introductionComplete) {
        navigate("Main");
      } else if (user && user.attributes && !introductionComplete) {
        navigate("IntroSlider");
      } else {
        navigate("Auth");
      }
    } catch {
      navigate("Auth");
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        backgroundColor: "#222B45"
      }}
    >
      <ActivityIndicator animating size="large" color="#fff" />
    </View>
  );
}

export default memo(AppLoading);
