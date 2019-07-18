import React, { ReactElement, memo, useContext, Fragment } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { TopNavigation } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";
import OrderContext from "../orders/OrderContext";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
  authLayout: boolean;
};

function Topbar({
  navigation: { openDrawer, state, goBack },
  authLayout = false
}: Props): ReactElement {
  const orderContext: import('../orders/OrderContext').OrderContextInterface = useContext(OrderContext);
  const hasNavigated: boolean = state.routes.length > 1;

  function renderLeftControl(): ReactElement {
    return (
      <Fragment>
        {hasNavigated ? (
          <TouchableOpacity
            onPress={() => goBack(null)}
            style={{ paddingRight: 10 }}
          >
            <Icon name="keyboard-arrow-left" size={30} color="white" />
          </TouchableOpacity>
        ) : null}
        {!authLayout ? (
          <TouchableOpacity onPress={openDrawer}>
            <Icon name="dehaze" size={30} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={{ height: 35 }} />
        )}
      </Fragment>
    );
  }

  function renderRightControl(): ReactElement {
    return !hasNavigated ? (
      <TouchableOpacity onPress={() => orderContext.toggleFiltersModal(true)}>
        <Icon name="filter-list" size={30} color="white" />
      </TouchableOpacity>
    ) : null;
  }

  return (
    <TopNavigation
      title="Potluck Driver"
      leftControl={renderLeftControl()}
      rightControls={authLayout ? null : renderRightControl()}
      alignment="center"
      style={styles.container}
      titleStyle={{ paddingTop: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1C1E1D",
    alignItems: "center",
    paddingTop: 30
  }
});

export default memo(Topbar);
