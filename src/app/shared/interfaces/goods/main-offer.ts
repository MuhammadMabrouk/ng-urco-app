export interface MainOffer {
  id?: string;
  images?: string[];
  name?: { en?: string; ar?: string; };
  price?: number;
  type?: string;
  amount?: number;
  priceAfterDiscount?: number;
}
