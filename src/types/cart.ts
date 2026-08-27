// Shopping-cart line item (guest + logged-in cart, order summary).

export type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  size?: string;
  img: string;
};
