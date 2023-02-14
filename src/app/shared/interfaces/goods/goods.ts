export interface Goods {
  seqNo?: number;
  id?: string;
  dateAdded?: string;
  name?: { en?: string; ar?: string; };
  images?: string[];
  desc?: { en?: string; ar?: string; };
  sizes?: string[];
  size?: string;
  color?: string;
  rating?: number;

  // price properties
  price?: number;
  discount?: number;
  priceAfterDiscount?: number;
  qty?: number;
  total?: number;

  // categories properties
  category?: {
    catName?: { en?: string; ar?: string; };
    catSlug?: string;
    children?: {
      catName?: { en?: string; ar?: string; };
      catSlug?: string;
    }
  };
  mainCatSlug?: string; // for filtering goods in shop page

  // labels shown on the good card
  newLabel?: boolean;
  bestLabel?: boolean;
  oosLabel?: boolean;

  // for every user orders goods
  returned?: boolean;
}
