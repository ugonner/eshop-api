export enum OrderStatus {
    PENDING = "Pending",
    PAID_AND_PROCESSING = "Paid_and_Processing",
    DELIVERED = "Delivered",
    CANCELLED = "Cancelled"
}
export enum OrderOrderFields {
    TOTAL_AMOUNT = "totalAmount"
}

export enum OrderShippingMethodType {
    WALK_IN = "walkIn",
    PICK_UP_STATION = "pickUpStation",
    PICK_UP_GIG = "pickUpGig",
    DOOR_STEP = "doorStep"
}