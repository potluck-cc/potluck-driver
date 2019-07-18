import React, {
  memo,
  useState,
  useEffect,
  useContext,
  ReactElement,
  Fragment
} from "react";

import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform
} from "react-native";
import { Text, Button } from "react-native-ui-kitten";
import OrderActionConfirmModal from "./OrderActionConfirmModal";

import OrderContext from "./OrderContext";
import client from "../client";
import UpdateOrder from "../mutations/UpdateOrder";
import { capitalize } from "@potluckmarket/ella";

enum NavigationType {
  user = "user",
  store = "store"
}

type OrderComponentProps = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

type ProductItemProps = {
  order: import("@potluckmarket/louis").OrderItem;
};

const ProductItem = memo(
  ({
    order: {
      product: { name },
      productType,
      option,
      quantity,
      isCannabisProduct,
      price
    }
  }: ProductItemProps): ReactElement => (
    <View style={styles.orderItem}>
      <Text>{name}</Text>
      <Text>{productType}</Text>
      <Text>
        {isCannabisProduct
          ? `${price}`
          : `${capitalize(option.weight)}(${quantity})`}
      </Text>
    </View>
  )
);

function Order({
  navigation: { getParam }
}: OrderComponentProps): ReactElement {
  const order = getParam("order", {});

  const {
    removeOrderFromTrip,
    addOrderToTrip,
    isOrderInTrip
  }: import("./OrderContext").OrderContextInterface = useContext(OrderContext);

  const [loading, isLoading] = useState(false);

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const [isOrderInTripEvenAfterStateUpdate, setIsOrderInTrip] = useState(
    isOrderInTrip(order.id)
  );

  const [navigationSteps, setNavigationStep] = useState("navigate");

  useEffect(() => {
    setIsOrderInTrip(isOrderInTrip(order.id));
  }, [addOrderToTrip, removeOrderFromTrip]);

  function renderItems(): ReactElement {
    return order.products.map((item, index) => (
      <ProductItem key={index} order={item} />
    ));
  }

  async function updateOrderDeliveryStatus(
    deliveryStatus: string
  ): Promise<void> {
    const { appsyncFetch, OperationType } = await import("@potluckmarket/ella");

    appsyncFetch({
      client,
      operationType: OperationType.mutation,
      document: UpdateOrder,
      variables: {
        orderID: order.id,
        deliveryStatus
      }
    });
  }

  async function confirmOrderIsComplete(): Promise<void> {
    const { stopLocationUpdatesAsync } = await import("expo-location");
    updateOrderDeliveryStatus("complete");
    stopLocationUpdatesAsync("trackDriver");
  }

  async function navigate(navigationType: NavigationType): Promise<void> {
    isLoading(true);

    const {
      startLocationUpdatesAsync,
      geocodeAsync,
      Accuracy,
      ActivityType
    } = await import("expo-location");

    const { askAsync, LOCATION } = await import("expo-permissions");

    let { status } = await askAsync(LOCATION);

    if (status !== "granted") {
      isLoading(false);

      return alert(
        "You need provide access to your location in order to navigate!"
      );
    } else {
      try {
        if (navigationType === NavigationType.store) {
          await updateOrderDeliveryStatus("pickup");

          if (Platform.OS === "ios") {
            Linking.openURL(
              `http://maps.apple.com/maps?daddr=${order.store.latitude},${
                order.store.longitude
              }`
            );
          } else {
            Linking.openURL(
              `http://maps.google.com/maps?daddr=${order.store.latitude},${
                order.store.longitude
              }`
            );
          }
        } else {
          await startLocationUpdatesAsync("trackDriver", {
            distanceInterval: 4024,
            showsBackgroundLocationIndicator: true,
            pausesUpdatesAutomatically: true,
            accuracy: Accuracy.BestForNavigation,
            activityType: ActivityType.AutomotiveNavigation
          });

          await updateOrderDeliveryStatus("deliver");

          const location = await geocodeAsync(
            `${order.user.street}, ${order.user.city} ${order.user.state}`
          );
          const lat = location[0].latitude;
          const long = location[0].longitude;

          if (Platform.OS === "ios") {
            Linking.openURL(`http://maps.apple.com/maps?daddr=${lat},${long}`);
          } else {
            Linking.openURL(`http://maps.google.com/maps?daddr=${lat},${long}`);
          }

          setNavigationStep("confirmOrCancel");
        }
        isLoading(false);
      } catch {
        isLoading(false);
      }
    }
  }

  async function cancelNavigate(): Promise<void> {
    isLoading(true);
    const { stopLocationUpdatesAsync } = await import("expo-location");
    await updateOrderDeliveryStatus("pending");
    setNavigationStep("navigate");
    stopLocationUpdatesAsync("trackDriver");
    isLoading(false);
  }

  function completeNavigate(): void {
    isLoading(true);
    setConfirmModalOpen(true);
  }

  async function onConfirmCompleteNavigate(): Promise<void> {
    await confirmOrderIsComplete();
    setNavigationStep("navigate");
    isLoading(false);
    setConfirmModalOpen(false);
  }

  function renderActions(): ReactElement {
    if (loading) {
      return <ActivityIndicator size="large" />;
    }

    if (order.deliveryStatus === "complete") {
      return <Text category="h5">Compensation: $16</Text>;
    }

    if (isOrderInTripEvenAfterStateUpdate) {
      switch (navigationSteps) {
        case "navigate":
          return (
            <Fragment>
              <Button
                status="info"
                onPress={() => navigate(NavigationType.store)}
              >
                Navigate Store
              </Button>
              <Button onPress={() => navigate(NavigationType.user)}>
                Navigate Customer
              </Button>
            </Fragment>
          );

        case "confirmOrCancel":
          return (
            <Fragment>
              <Button status="warning" onPress={() => completeNavigate()}>
                Complete
              </Button>
              <Button status="danger" onPress={() => cancelNavigate()}>
                Cancel
              </Button>
            </Fragment>
          );

        default:
          return (
            <Fragment>
              <Button
                status="info"
                onPress={() => navigate(NavigationType.store)}
              >
                Navigate Store
              </Button>
              <Button onPress={() => navigate(NavigationType.user)}>
                Navigate Customer
              </Button>
            </Fragment>
          );
      }
    } else {
      return (
        <Button
          status="success"
          onPress={() => {
            addOrderToTrip(order);
          }}
        >
          ADD TO TRIP
        </Button>
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.orderDetails}>
        <Text category="h1">{`Order #${order.id.split("-")[0]}`}</Text>
        <Text category="h6">{`From: ${order.store.name}`}</Text>
        <Text category="c1">{`To: ${order.user.city}`}</Text>
        {order.deliveryStatus !== "complete" ? (
          <Fragment>
            <Text category="c1">{`Customer Name: ${order.user.firstname} ${
              order.user.lastname
            }`}</Text>
            <Text category="c1">{`Patiend ID#: ${order.user.patientID}`}</Text>
          </Fragment>
        ) : null}
      </View>
      <ScrollView style={styles.orderItemsList}>{renderItems()}</ScrollView>
      {order.deliveryStatus !== "complete" ? (
        <Text style={styles.total} category="h3">
          {`Total: ${order.totalDisplayValue}`}
        </Text>
      ) : null}
      <View style={styles.actions}>{renderActions()}</View>
      <OrderActionConfirmModal
        isOpen={isConfirmModalOpen}
        hide={(): void => {
          setConfirmModalOpen(false);
          isLoading(false);
        }}
        onConfirm={() => onConfirmCompleteNavigate()}
        message="Are you sure you're done delivering this order?"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#222B45",
    flex: 1
  },
  orderDetails: {
    padding: 10
  },
  orderItemsList: {
    padding: 25,
    marginBottom: 80
  },
  orderItem: {
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    borderBottomColor: "white",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  total: {
    marginBottom: 30,
    textAlign: "center"
  },
  actions: {
    height: 80,
    padding: 10,
    borderTopColor: "orange",
    borderTopWidth: 1,
    backgroundColor: "#1C1E1D",
    flexDirection: "row",
    justifyContent: "space-evenly"
  }
});

export default memo(Order);
