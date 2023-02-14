import { IMyDate } from 'angular-mydatepicker';

export interface Coupons {
  id?: string; // code
  seqNo?: number;
  type?: string; // percent | fixed
  amount?: number;
  ExpDate?: IMyDate;
  usesLimit?: number;
  usesNo?: number;
  enabled?: boolean;
}
