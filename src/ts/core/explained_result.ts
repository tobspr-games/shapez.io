export class ExplainedResult {
    public result: boolean = result;
    public reason: string = reason;

    constructor(result = true, reason = null, additionalProps = {}) {
        // Copy additional props
        for (const key: any in additionalProps) {
            this[key] = additionalProps[key];
        }
    }
    isGood(): any {
        return !!this.result;
    }
    isBad(): any {
        return !this.result;
    }
    static good(): any {
        return new ExplainedResult(true);
    }
    static bad(reason: any, additionalProps: any): any {
        return new ExplainedResult(false, reason, additionalProps);
    }
    static requireAll(...args: any): any {
        for (let i: any = 0; i < args.length; ++i) {
            const subResult: any = args[i].call();
            if (!subResult.isGood()) {
                return subResult;
            }
        }
        return this.good();
    }
}
