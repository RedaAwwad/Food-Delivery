class CustomerOrdersDTO {
  id: string = "";
  phone: string = "";
  avatar: string | null = null;
  user: {
    name: string;
    email: string;
  } = null as any;
  orders: {
    id: string;
    totalAmount: number;
    orderStatus: {
      id: number;
      name: string;
      // key: string;
    };
  }[] = [];

  constructor(order: any) {
    Object.assign(this, order);
  }
}

export { CustomerOrdersDTO };
