import React, {
  ReactElement,
  useContext,
  useState,
  memo,
  useEffect
} from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Modal from "react-native-modalbox";
import DateTimePicker from "react-native-modal-datetime-picker";
import OrderContext from "./OrderContext";
import { Text } from "react-native-ui-kitten";
import { dateFormat } from "@potluckmarket/ella";
import { Icon } from "react-native-elements";

const { width, height } = Dimensions.get("window");

function FiltersModal(): ReactElement {
  const orderContext: import("./OrderContext").OrderContextInterface = useContext(
    OrderContext
  );
  const [isDatePickerOpen, setDatePickerOpen] = useState(false);

  const [dateFilterActive, setDateFilterActive] = useState(false);

  async function handleDatePicked(date: Date): Promise<void> {
    const moment = await import("moment");
    orderContext.setDate(moment.default(date).format(dateFormat));
    if (!dateFilterActive) {
      setDateFilterActive(true);
    }
    setDatePickerOpen(false);
  }

  async function resetDateFilter(): Promise<void> {
    const moment = await import("moment");
    orderContext.setDate(moment.default().format(dateFormat));
  }

  useEffect(() => {
    if (!dateFilterActive) {
      resetDateFilter();
    }
  }, [dateFilterActive]);

  return (
    <Modal
      isOpen={orderContext.filtersModalOpen}
      style={styles.modal}
      onClosed={() => orderContext.toggleFiltersModal(false)}
      position="top"
      entry="top"
      backdropColor="#1C1E1D"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.text} category="h5">
            Filters
          </Text>
          <TouchableOpacity
            onPress={() => orderContext.toggleFiltersModal(false)}
          >
            <Icon name="close" size={30} color="#eee" />
          </TouchableOpacity>
        </View>

        <View style={styles.filter}>
          <TouchableOpacity
            onPress={() => {
              setDateFilterActive(!dateFilterActive);
            }}
            style={styles.filterToggle}
          >
            <Icon
              name={
                dateFilterActive ? "checkbox-marked" : "checkbox-blank-outline"
              }
              type="material-community"
              color={dateFilterActive ? "orange" : "#ddd"}
            />

            <Text
              style={{
                ...styles.text,
                color: dateFilterActive ? "#fff" : "#ddd"
              }}
              category="s1"
            >
              Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDatePickerOpen(true)}>
            <Text
              style={{
                ...styles.text,
                color: dateFilterActive ? "orange" : "#ddd"
              }}
              category="s1"
            >
              {orderContext.currentDate}
            </Text>
          </TouchableOpacity>
        </View>

        <DateTimePicker
          isVisible={isDatePickerOpen}
          onConfirm={handleDatePicked}
          onCancel={() => setDatePickerOpen(false)}
          is24Hour={false}
          mode="date"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    height: height / 2.5,
    width,
    marginTop: 8,
    backgroundColor: "#1C1E1D"
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 5
  },
  header: {
    flexDirection: "row",
    borderBottomColor: "orange",
    borderBottomWidth: 1,
    width: "100%",
    paddingLeft: 5,
    paddingRight: 5,
    justifyContent: "space-between"
  },
  filter: {
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
    marginTop: 10,
    paddingLeft: 20,
    paddingRight: 30,
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center"
  },
  filterToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  text: {
    color: "#eee",
    paddingLeft: 10
  }
});

export default memo(FiltersModal);
