export interface CreditCardType {
  niceType?: string;
  type?: string;
  gaps?: number[];
  lengths?: number[];
  code?: { name: string, size: number };
}
