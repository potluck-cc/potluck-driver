import React, {
  ReactElement,
  memo,
  useContext,
  useEffect,
  useState
} from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { List, Text } from "react-native-ui-kitten";

import OrderContext from "./OrderContext";

import client from "../client";
import { useLazyAppSyncQuery, OperationType } from "@potluckmarket/ella";
import ListPreviouslyAcceptedOrders from "../queries/ListPreviouslyAcceptedOrders";

import { OrderListItem } from "../common";
import OrderActionConfirmModal from "./OrderActionConfirmModal";
import AppContext from "../AppContext";

function SelectedOrders({ navigate }): ReactElement {
  const orderContext: import("./OrderContext").OrderContextInterface = useContext(
    OrderContext
  );

  const appContext: import("../AppContext").AppContextInterface = useContext(
    AppContext
  );

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [
    currentPreviouslySelectedOrders,
    loading,
    fetchOrders
  ] = useLazyAppSyncQuery({
    client,
    document: ListPreviouslyAcceptedOrders,
    operationType: OperationType.query,
    fetchPolicy: "network-only"
  });

  const searchVariables = {
    status: "accepted",
    driver: appContext.driver.id
  };

  useEffect(() => {
    if (appContext.driver && appContext.driver.id) {
      fetchOrders(searchVariables);
    }
  }, [appContext.driver.id]);

  useEffect(() => {
    if (
      currentPreviouslySelectedOrders &&
      currentPreviouslySelectedOrders.listOrders &&
      currentPreviouslySelectedOrders.listOrders.items
    ) {
      orderContext.setTrip(currentOrders => {
        return [...currentPreviouslySelectedOrders.listOrders.items];
      });
    }
  }, [currentPreviouslySelectedOrders]);

  function renderItem({ item }): ReactElement {
    const {
      user: { city },
      store: { name }
    } = item;
    return (
      <OrderListItem
        key={item.id}
        title={name}
        description={`To: ${city}`}
        id={item.id}
        btnText="REMOVE"
        btnStatus="danger"
        onBtnPress={() => {
          setSelectedOrder(item);
          setConfirmModalOpen(true);
        }}
        onItemPress={() =>
          navigate("SingleOrder", {
            order: item
          })
        }
      />
    );
  }

  if (!orderContext.trip.length) {
    return (
      <View style={styles.emptyMessageContainer}>
        <Text category="h1">No Orders Selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <List
        data={orderContext.trip}
        renderItem={renderItem}
        style={styles.list}
        onEndReached={() => {
          if (
            currentPreviouslySelectedOrders &&
            currentPreviouslySelectedOrders.listOrders &&
            currentPreviouslySelectedOrders.listOrders.nextToken
          ) {
            fetchOrders({
              ...searchVariables,
              nextToken: currentPreviouslySelectedOrders.listOrders.nextToken
            });
          }
        }}
        refreshing={loading}
        onRefresh={() => fetchOrders(searchVariables)}
        ListFooterComponent={() => {
          if (loading) {
            return (
              <View style={styles.activityIndicatorContainer}>
                <ActivityIndicator size="large" />
              </View>
            );
          } else {
            return null;
          }
        }}
      />
      <OrderActionConfirmModal
        isOpen={isConfirmModalOpen}
        hide={() => setConfirmModalOpen(false)}
        onConfirm={() => {
          orderContext.removeOrderFromTrip(selectedOrder);
          setConfirmModalOpen(false);
        }}
        message="Are you sure you want to remove this order from your trip?"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5,
    backgroundColor: "transparent"
  },
  loader: {
    marginTop: 10
  },
  list: {
    flex: 1,
    backgroundColor: "transparent"
  },
  emptyMessageContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  activityIndicatorContainer: {
    marginTop: 10
  }
});

export default memo(SelectedOrders);
