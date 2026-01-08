import { OrderContext } from "../../types/OrderContext";

export abstract class OrderHandler {
    private nextHandler?: OrderHandler;

    public setNext(handler: OrderHandler): OrderHandler {
        this.nextHandler = handler;
        return handler;
    }

    public async execute(context: OrderContext): Promise<OrderContext> {
        await this.handle(context);

        if (this.nextHandler) {
            return this.nextHandler.execute(context);
        }

        return context;
    }

    protected abstract handle(context: OrderContext): Promise<void>;
}
