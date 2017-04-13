import {MonetaryAmount} from './monetary-amount';

export class Booking {
    monetaryAmount: MonetaryAmount;

    constructor(
        public $key: string,
        public from: Date,
        public to: Date,
        public sharableThingKey: string,
        public userBookingEmail: string,
        public removed: boolean,
        daylyChargeAmount?: number,
        daylyChargeCurrency?: string) {
            this.monetaryAmount = new MonetaryAmount(daylyChargeAmount, daylyChargeCurrency);
    }

    // tslint:disable-next-line:member-ordering
    static fromJson({$key, from, to, sharableThingKey, userBookingEmail, removed,
                    daylyChargeAmount, daylyChargeCurrency}) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        return new Booking($key, fromDate, toDate, sharableThingKey, userBookingEmail, removed,
                    daylyChargeAmount, daylyChargeCurrency);
    }

    static fromJsonArray(json: any[]): Booking[] {
        return json.map(Booking.fromJson);
    }

}
