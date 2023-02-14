import { UserProfile } from 'src/app/shared/interfaces/user/user-profile';
import { Goods } from 'src/app/shared/interfaces/goods/goods';

export interface ReturnDetails {
  userInfo: UserProfile;
  good: Goods;
  reasons: string[];
  comments?: string;
}
