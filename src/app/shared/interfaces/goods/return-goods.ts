import { ReturnDetails } from 'src/app/shared/interfaces/goods/return-details';

export interface ReturnGoods extends ReturnDetails {
  id?: string;
  seqNo?: number;
  placedDate?: string;
  deliveredDate?: string;
  returnedDate?: string;
}
