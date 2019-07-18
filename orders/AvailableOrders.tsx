import React, {
  memo,
  useState,
  useEffect,
  useContext,
  ReactElement
} from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { List } from "react-native-ui-kitten";

import OrderContext from "./OrderContext";

import { OrderListItem } from "../common";

import client from "../client";
import ListAvailableOrders from "../queries/ListAvailableOrders";
import UpdateOrderSubscription from "../subscriptions/UpdateOrderSubscription";
import { useLazyAppSyncQuery, OperationType } from "@potluckmarket/ella";
import AppContext from "../AppContext";

type Props = {
  navigate: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >["navigate"];
};

function AvailableOrders({ navigate }: Props): ReactElement {
  const orderContext: import("./OrderContext").OrderContextInterface = useContext(
    OrderContext
  );

  const appContext: import("../AppContext").AppContextInterface = useContext(
    AppContext
  );

  const [orders, setOrders] = useState([]);

  async function subscribeToOrder(id): Promise<void> {
    const { appsyncFetch } = await import("@potluckmarket/ella");

    appsyncFetch({
      client,
      document: UpdateOrderSubscription,
      operationType: OperationType.subscribe,
      variables: { id },
      next: ({ data: { onUpdateOrder } }) => {
        if (
          onUpdateOrder &&
          onUpdateOrder.driver &&
          onUpdateOrder.driver.id !== appContext.driver.id
        ) {
          setOrders(currentOrders =>
            currentOrders.filter(order => order.id !== onUpdateOrder.id)
          );
        }
      }
    });
  }

  const searchVariables = {
    status: "accepted",
    date: orderContext.currentDate,
    nextToken: null
  };

  const [currOrders, loading, fetchOrders] = useLazyAppSyncQuery({
    client,
    document: ListAvailableOrders,
    operationType: OperationType.query,
    fetchPolicy: "network-only"
  });

  useEffect(() => {
    fetchOrders(searchVariables);
  }, []);

  useEffect(() => {
    if (currOrders && currOrders.listOrders && currOrders.listOrders.items) {
      setOrders(currOrders.listOrders.items);
    }
  }, [currOrders]);

  useEffect(() => {
    fetchOrders(searchVariables);
  }, [orderContext.currentDate]);

  function renderItem({ item }): ReactElement {
    const {
      user: { city },
      store: { name }
    } = item;

    subscribeToOrder(item.id);

    return (
      <OrderListItem
        title={name}
        description={`To: ${city}`}
        id={item.id}
        btnText="ADD"
        btnStatus="success"
        onBtnPress={() => orderContext.addOrderToTrip(item)}
        onItemPress={() =>
          navigate("SingleOrder", {
            order: item
          })
        }
        isDisabled={orderContext.isOrderInTrip(item.id)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <List
        data={orders}
        renderItem={renderItem}
        style={styles.list}
        onEndReached={() => {
          if (
            currOrders &&
            currOrders.listOrders &&
            currOrders.listOrders.nextToken
          ) {
            fetchOrders({
              ...searchVariables,
              nextToken: currOrders.listOrders.nextToken
            });
          }
        }}
        refreshing={loading}
        onRefresh={() => fetchOrders(searchVariables)}
        ListFooterComponent={() => {
          if (loading) {
            return (
              <View style={styles.loader}>
                <ActivityIndicator size="large" />
              </View>
            );
          } else {
            return null;
          }
        }}
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
  list: {
    flex: 1,
    backgroundColor: "transparent"
  },
  loader: {
    marginTop: 10
  }
});

export default memo(AvailableOrders);
