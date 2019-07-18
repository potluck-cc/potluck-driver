import React, { memo, useState, ReactElement, useEffect } from "react";
import { StatusBar } from "react-native";
import { mapping, dark as darkTheme } from "@eva-design/eva";
import { ApplicationProvider, Layout } from "react-native-ui-kitten";

import Navigator from "./navigation";

import OrderContext from "./orders/OrderContext";
import AppContext from "./AppContext";

import client from "./client";
import {
  OperationType,
  dateFormat,
  useLazyAppSyncQuery
} from "@potluckmarket/ella";
import UpdateOrder from "./mutations/UpdateOrder";
import UpdateDriver from "./mutations/UpdateDriver";
import GetDriver from "./queries/GetDriver";

import moment from "moment";

import Amplify, { Auth } from "aws-amplify";
import awsConfig from "./aws-exports";

import { defineTask } from "expo-task-manager";

import { AppLoading } from "expo";

import { loadAsync } from "expo-font";

Amplify.configure(awsConfig);

defineTask(
  "trackDriver",
  async ({ data }): Promise<void> => {
    if (data) {
      const { retrieveData } = await import("./storage");

      const driverID = await retrieveData("driverID");

      if (driverID) {
        const { appsyncFetch } = await import("@potluckmarket/ella");

        const { locations } = data;

        const location = locations[0].coords;

        const currentLocation = {
          latitude: location.latitude,
          longitude: location.longitude
        };

        await appsyncFetch({
          client,
          operationType: OperationType.mutation,
          document: UpdateDriver,
          variables: {
            id: driverID,
            currentLocation: JSON.stringify(currentLocation)
          }
        });
      }
    }
  }
);

function App(): ReactElement {
  const [selected, setTrip] = useState([]);
  const [filtersModalOpen, setFiltersModal] = useState(false);
  const [currentDate, setDate] = useState(
    moment(new Date()).format(dateFormat)
  );
  const [activeNavigatingOrder, setActiveNavigatingOrder] = useState({});

  const [driver, fetchingDriverInformation, fetchDriver] = useLazyAppSyncQuery({
    client,
    operationType: OperationType.query,
    document: GetDriver,
    fetchPolicy: "network-only"
  });

  const [cognitoData, setCognitoData] = useState(null);

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (driver && driver.listDrivers && driver.listDrivers.items) {
      saveDriverID(driver.listDrivers.items[0]);
    }
  }, [driver]);

  async function _loadResourcesAsync(): Promise<void[]> {
    return Promise.all([
      loadAsync({
        "Material Design Icons": require("./node_modules/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"),
        "Material Icons": require("./node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf")
      })
    ]);
  }

  async function initialize(): Promise<void> {
    const user = await Auth.currentAuthenticatedUser();

    if (user && user.attributes) {
      setCognitoData(user.attributes);

      fetchDriver({
        phone: user.attributes.phone_number
      });
    }
  }

  async function saveDriverID(
    driver: import("@potluckmarket/louis").Driver
  ): Promise<void> {
    const { storeData, retrieveData } = await import("./storage");
    const driverID = await retrieveData("driverID");
    if (driverID !== driver.id) {
      await storeData("driverID", driver.id);
    }
  }

  async function addOrderToTrip(
    order: import("@potluckmarket/louis").Order
  ): Promise<void> {
    const { appsyncFetch } = await import("@potluckmarket/ella");

    const res = await appsyncFetch({
      client,
      document: UpdateOrder,
      operationType: OperationType.mutation,
      variables: {
        orderID: order.id,
        driver: driver.listDrivers.items[0].id
      }
    });

    if (res) {
      setTrip(currentTripList => [...new Set([...currentTripList, order])]);
    }
  }

  async function removeOrderFromTrip(
    order: import("@potluckmarket/louis").Order
  ): Promise<void> {
    const { appsyncFetch } = await import("@potluckmarket/ella");

    const res = await appsyncFetch({
      client,
      document: UpdateOrder,
      operationType: OperationType.mutation,
      variables: {
        orderID: order.id,
        driver: null
      }
    });

    if (res) {
      setTrip(currentTripList =>
        currentTripList.filter(
          previouslySelectedOrder => previouslySelectedOrder.id !== order.id
        )
      );
    }
  }

  function isOrderInTrip(orderId: string): boolean {
    const foundOrder = selected.findIndex(trip => trip.id === orderId);
    return foundOrder >= 0 ? true : false;
  }

  function toggleFiltersModal(value: boolean): void {
    setFiltersModal(value);
  }

  if (!appReady) {
    return (
      <AppLoading
        startAsync={async () => {
          await _loadResourcesAsync();
        }}
        onFinish={() => setAppReady(true)}
      />
    );
  }

  return (
    <ApplicationProvider mapping={mapping} theme={darkTheme}>
      <StatusBar barStyle="light-content" />
      <Layout style={{ flex: 1 }}>
        <AppContext.Provider
          value={{
            driver:
              driver && driver.listDrivers ? driver.listDrivers.items[0] : {},
            cognitoData,
            fetchingDriverInformation
          }}
        >
          <OrderContext.Provider
            value={{
              trip: selected,
              setTrip,
              addOrderToTrip,
              removeOrderFromTrip,
              isOrderInTrip,
              filtersModalOpen,
              toggleFiltersModal,
              currentDate,
              setDate,
              activeNavigatingOrder,
              setActiveNavigatingOrder
            }}
          >
            <Navigator />
          </OrderContext.Provider>
        </AppContext.Provider>
      </Layout>
    </ApplicationProvider>
  );
}

export default memo(App);
