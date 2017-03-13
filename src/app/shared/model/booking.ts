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
        return new Booking($key, from, to, sharableThingKey, userBookingEmail, removed,
                    daylyChargeAmount, daylyChargeCurrency);
    }

    static fromJsonArray(json: any[]): Booking[] {
        return json.map(Booking.fromJson);
    }

}
