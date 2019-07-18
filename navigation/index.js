import React from "react";

import {
  createDrawerNavigator,
  createStackNavigator,
  createSwitchNavigator,
  createAppContainer
} from "react-navigation";

import Topbar from "../layout/Topbar";
import OrderList from "../orders";
import SingleOrder from "../orders/Order";
import CompletedOrders from "../orders/CompletedOrders";
import Settings from "../settings";

import {
  SignIn,
  SignUp,
  Confirm,
  ForgotPassword,
  ChangeUsername
} from "../authentication";

import {
  DrivingDocuments,
  HandlerLicenseScanner,
  IntroSlider
} from "../introduction";

import AppLoading from "./AppLoading";

const OrderStack = createStackNavigator(
  {
    OrderList,
    SingleOrder,
    CompletedOrders,
    DrivingDocuments,
    HandlerLicenseScanner,
    ChangeUsername
  },
  {
    defaultNavigationOptions: {
      header: props => <Topbar {...props} />
    }
  }
);

const App = createDrawerNavigator(
  {
    Main: {
      screen: OrderStack
    }
  },
  {
    contentComponent: props => <Settings {...props} />
  }
);

const Authentication = createStackNavigator(
  {
    SignIn,
    SignUp,
    Confirm,
    ForgotPassword
  },
  {
    defaultNavigationOptions: {
      header: props => <Topbar {...props} authLayout />
    }
  }
);

export default createAppContainer(
  createSwitchNavigator(
    {
      Main: App,
      Auth: Authentication,
      IntroSlider,
      AppLoading
    },
    {
      initialRouteName: "AppLoading"
    }
  )
);
