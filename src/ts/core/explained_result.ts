export class ExplainedResult {
    public result: boolean;
    public reason: string;

    constructor(result = true, reason: string = null, additionalProps = {}) {
        this.result = result;
        this.reason = reason;

        // Copy additional props
        for (const key in additionalProps) {
            this[key] = additionalProps[key];
        }
    }

    isGood() {
        return !!this.result;
    }

    isBad() {
        return !this.result;
    }

    static good() {
        return new ExplainedResult(true);
    }

    static bad(reason?: string, additionalProps?: object) {
        return new ExplainedResult(false, reason, additionalProps);
    }

    static requireAll(...args: (() => ExplainedResult)[]) {
        for (let i = 0; i < args.length; ++i) {
            const subResult = args[i].call(undefined);
            if (!subResult.isGood()) {
                return subResult;
            }
        }
        return this.good();
    }
}
