export interface BookingRecord {
    from: string;
    to: string;
    monetaryAmount: {amount: number; currency: string};
    sharableThingKey: string;
    userBookingEmail: string;
    removed: boolean;
    $key?: string;
}
