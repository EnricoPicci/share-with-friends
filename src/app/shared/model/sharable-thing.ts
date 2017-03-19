import {MonetaryAmount} from './monetary-amount';

export class SharableThing {
    monetaryAmount: MonetaryAmount;

    constructor(
        public $key: string,
        public name?: string,
        public description?: string,
        public images?: Array<any>,
        public ownerEmail?: string,
        public friendEmails?: Array<string>,
        public removed?: boolean,
        daylyChargeAmount?: number,
        daylyChargeCurrency?: string) {
            this.monetaryAmount = new MonetaryAmount(daylyChargeAmount, daylyChargeCurrency);
            if (!this.images) {this.images = []; }
            if (!this.friendEmails) {this.friendEmails = []; }
            if (!this.removed) {this.removed = false; }
    }

    // tslint:disable-next-line:member-ordering
    static fromJson({$key, name, description, images,
                    ownerEmail, friendEmails, removed,
                    daylyChargeAmount, daylyChargeCurrency}) {
        return new SharableThing($key, name, description, images,
                                ownerEmail, friendEmails, removed,
                                daylyChargeAmount, daylyChargeCurrency);
    }

    static fromJsonArray(json: any[]): SharableThing[] {
        return json.map(SharableThing.fromJson);
    }

}
