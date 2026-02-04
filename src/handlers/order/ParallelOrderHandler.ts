import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";

export class ParallelOrderHandler extends OrderHandler {
    constructor(
        private backgroundHandlers: OrderHandler[]
    ) {
        super();
    }

    protected async handle(context: OrderContext): Promise<void> {
        // 1. Fire background handlers (Fire and Forget)
        if (this.backgroundHandlers.length > 0) {
            // CRITICAL: Remove 'tx' from context for background handlers!
            // They must use a fresh connection because the main transaction will close immediately after this handler returns.
            const { tx, ...safeContext } = context;

            // Small delay to ensure the main transaction commits before background tasks try to read the Order
            setTimeout(() => {
                Promise.all(this.backgroundHandlers.map(h => h.execute(safeContext as OrderContext)))
                    .catch(err => {
                        console.error("[ParallelOrderHandler] Background handler error:", err);
                    });
            }, 500);
        }
    }
}
