import React, { ReactElement, memo, useContext } from "react";
import { StyleSheet } from "react-native";
import { ListItem, Button } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";
import OrderContext from "../orders/OrderContext";

export type Props = {
  title: string;
  description: string;
  id: string;
  btnText: string;
  btnStatus: import("react-native-ui-kitten").ButtonProps["status"];
  onBtnPress: Function;
  onItemPress: Function;
  isOrderComplete?: boolean;
  isDisabled?: boolean;
};

function OrderListItem({
  title,
  description,
  id,
  btnText,
  btnStatus,
  onBtnPress,
  onItemPress,
  isOrderComplete = false,
  isDisabled = false
}: Props): ReactElement<Props> {
  const orderContext: import("../orders/OrderContext").OrderContextInterface = useContext(
    OrderContext
  );
  const isOrderInTrip: boolean = orderContext.isOrderInTrip(id);
  return (
    <ListItem
      title={title}
      description={description}
      onPress={() => onItemPress()}
      icon={() => (
        <Icon
          name={
            isOrderInTrip
              ? "checkbox-marked-outline"
              : isOrderComplete
              ? "truck-check"
              : "checkbox-blank-outline"
          }
          type="material-community"
          color="white"
        />
      )}
      accessory={() => (
        <Button
          size="small"
          status={btnStatus}
          onPress={() => onBtnPress()}
          disabled={isDisabled}
        >
          {btnText}
        </Button>
      )}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: "white",
    borderBottomWidth: 1
  }
});

export default memo(OrderListItem);
