import { AsyncStorage } from "react-native";

export async function retrieveData(
  itemName: string
): Promise<string | boolean> {
  try {
    const value = await AsyncStorage.getItem(itemName);
    return value;
  } catch {
    return false;
  }
}

export async function storeData(
  itemName: string,
  itemToStore: string
): Promise<boolean> {
  try {
    await AsyncStorage.setItem(itemName, itemToStore);
    return true;
  } catch (err) {
    return false;
  }
}

export async function destroyData(itemName: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(itemName);
    return true;
  } catch (e) {
    return false;
  }
}
