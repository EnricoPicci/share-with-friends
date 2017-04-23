import {BookingStatus} from '../shared/model/booking';

export interface BookingRecord {
    from: string;
    to: string;
    monetaryAmount: {amount: number; currency: string};
    sharableThingKey: string;
    userBookingEmail: string;
    status: BookingStatus;
    $key?: string;
}
