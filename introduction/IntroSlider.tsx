import React, { memo, ReactElement } from "react";
import { View } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import Welcome from "./Welcome";
import HandlerLicenseScanner from "./HandlerLicenseScanner";
import DrivingDocuments from "./DrivingDocuments";
import { storeData } from "../storage";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

enum SlideType {
  welcome = "welcome",
  handlerLicense = "handler_license",
  drivingDocuments = "driving_documents"
}

const slides = [
  {
    key: SlideType.welcome
  },
  {
    key: SlideType.handlerLicense
  },
  {
    key: SlideType.drivingDocuments
  }
];

function IntroSlider({ navigation: { navigate } }: Props): ReactElement {
  function renderSlide({ key }): ReactElement {
    switch (key) {
      case SlideType.welcome:
        return <Welcome />;
      case SlideType.handlerLicense:
        return <HandlerLicenseScanner />;
      case SlideType.drivingDocuments:
        return <DrivingDocuments />;
      default:
        return <View />;
    }
  }

  return (
    <AppIntroSlider
      renderItem={renderSlide}
      slides={slides}
      onDone={async (): Promise<void> => {
        await storeData("introductionComplete", "true");
        navigate("AppLoading");
      }}
    />
  );
}

export default memo(IntroSlider);
