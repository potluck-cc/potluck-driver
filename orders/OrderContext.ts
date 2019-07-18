import { createContext, Dispatch, SetStateAction } from "react";
import { Order } from "@potluckmarket/louis";

export interface OrderContextInterface {
  trip: Order[];
  addOrderToTrip: (order: Order) => void;
  removeOrderFromTrip: (order: Order) => void;
  isOrderInTrip: (orderId: string) => boolean;
  setTrip: Dispatch<SetStateAction<any[]>>;
  filtersModalOpen: boolean;
  toggleFiltersModal: (value: boolean) => void;
  currentDate: string;
  setDate: Dispatch<SetStateAction<string>>;
  activeNavigatingOrder: Order | null;
  setActiveNavigatingOrder: (order: {}) => void;
}

export default createContext<OrderContextInterface | null>(null);
