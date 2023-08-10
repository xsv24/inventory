export class isNever extends Error {
    constructor(message: string) {
        super(message);
    }
}

export const unwrap = <T>(value: T | undefined | null) => {
    if(!value) {
        throw new Error("Failed to unwrap value");
    }

    return value;
}