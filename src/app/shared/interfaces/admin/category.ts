export interface Category {
  seqNo?: number;
  catName?: { en?: string; ar?: string; };
  catSlug?: string;
  catBrief?: { en?: string; ar?: string; };
  catIcon?: string;
  catImg?: string;
  children?: Category[];
}
