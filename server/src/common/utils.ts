import { logger } from "@skutopia/logger"

export class isNever extends Error {
    constructor(message: string) {
        super(message);
    }
}