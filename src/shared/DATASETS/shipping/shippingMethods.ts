import { OrderShippingMethodType } from "../../enums/order.enum";

export interface IShippingMethodDetail {
    type: OrderShippingMethodType,
    description: string;
    cost: number;
}

export const ShippingMethods: IShippingMethodDetail[] = [
    {
        type: OrderShippingMethodType.DOOR_STEP,
        description: "Items will be delivered at your door step, available in limited locations",
        cost: 5000
    },
    {
        type: OrderShippingMethodType.PICK_UP_GIG,
        description: "Items will be delivered at the closest God Is Good Transport Company Park",
        cost: 3500
    },
    {
        type: OrderShippingMethodType.PICK_UP_STATION,
        description: "Items will be delivered at our pick up station",
        cost: 3000
    },
    {
        type: OrderShippingMethodType.WALK_IN,
        description: "Pick items at our stores",
        cost: 0.00
    }
]  

