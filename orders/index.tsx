import React, { useState, memo, ReactElement, Fragment } from "react";
import { StyleSheet } from "react-native";
import { TabView, Tab } from "react-native-ui-kitten";

import AvailableOrders from "./AvailableOrders";
import SelectedOrders from "./SelectedOrders";
import FiltersModal from "./FiltersModal";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function OrdersLists({ navigation: { navigate } }: Props): ReactElement {
  const [selectedIndex, selectIndex] = useState(0);

  return (
    <Fragment>
      <TabView
        selectedIndex={selectedIndex}
        onSelect={selectIndex}
        style={styles.container}
      >
        <Tab title="Available" style={styles.tab}>
          <AvailableOrders navigate={navigate} />
        </Tab>
        <Tab title="Selected">
          <SelectedOrders navigate={navigate} />
        </Tab>
      </TabView>
      <FiltersModal />
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingLeft: 5,
    paddingRight: 5,
    flex: 1,
    backgroundColor: "#222B45"
  },
  tab: {
    flex: 1
  }
});

export default memo(OrdersLists);
