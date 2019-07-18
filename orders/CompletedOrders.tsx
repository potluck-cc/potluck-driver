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
import ListCompletedOrders from "../queries/ListCompletedOrders";
import { useLazyAppSyncQuery, OperationType } from "@potluckmarket/ella";
import AppContext from "../AppContext";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function CompletedOrders({ navigation: { navigate } }: Props): ReactElement {
  const orderContext: import("./OrderContext").OrderContextInterface = useContext(
    OrderContext
  );

  const appContext: import("../AppContext").AppContextInterface = useContext(
    AppContext
  );

  const [orders, setOrders] = useState([]);

  const searchVariables = {
    driver: appContext.driver.id
  };

  const [currOrders, loading, fetchOrders] = useLazyAppSyncQuery({
    client,
    document: ListCompletedOrders,
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

  function onPress(order): void {
    navigate("SingleOrder", {
      order
    });
  }

  function renderItem({ item }): ReactElement {
    const {
      user: { city },
      store: { name }
    } = item;

    return (
      <OrderListItem
        title={name}
        description={`To: ${city}`}
        id={item.id}
        isOrderComplete
        btnText="VIEW"
        btnStatus="info"
        onBtnPress={() => onPress(item)}
        onItemPress={() => onPress(item)}
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
    backgroundColor: "#222B45"
  },
  list: {
    flex: 1,
    backgroundColor: "#222B45"
  },
  loader: {
    marginTop: 10
  }
});

export default memo(CompletedOrders);
