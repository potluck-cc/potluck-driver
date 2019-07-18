import { createContext } from "react";
import { Driver } from "@potluckmarket/louis";

export interface AppContextInterface {
  driver: Driver;
  cognitoData: {};
  fetchingDriverInformation: boolean;
}

export default createContext<AppContextInterface | null>(null);
