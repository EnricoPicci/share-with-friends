import {MonetaryAmount} from './monetary-amount';

export enum BookingStatus  {
    Pending = <any>'Pending',
    Confirmed = <any>'Confirmed',
    Removed = <any>'Removed'
};

export class Booking {
    monetaryAmount: MonetaryAmount;

    constructor(
        public $key: string,
        public from: Date,
        public to: Date,
        public sharableThingKey: string,
        public userBookingEmail: string,
        // public removed: boolean,
        public status: BookingStatus = BookingStatus.Pending,
        daylyChargeAmount?: number,
        daylyChargeCurrency?: string) {
            this.monetaryAmount = new MonetaryAmount(daylyChargeAmount, daylyChargeCurrency);
    }

    // tslint:disable-next-line:member-ordering
    static fromJson({$key, from, to, sharableThingKey, userBookingEmail, status,
                    daylyChargeAmount, daylyChargeCurrency}) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        return new Booking($key, fromDate, toDate, sharableThingKey, userBookingEmail, status,
                    daylyChargeAmount, daylyChargeCurrency);
    }

    static fromJsonArray(json: any[]): Booking[] {
        return json.map(Booking.fromJson);
    }

    isRemoved() {
        return this.status === BookingStatus.Removed;
    }

}
