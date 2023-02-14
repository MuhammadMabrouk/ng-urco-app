import { Timezone } from 'src/app/shared/interfaces/timezone';

export interface GeneralSettings {
  shopGoodsLimit?: number;
  shippingCost?: number;
  returnPeriod?: number;
  timeZone?: Timezone;
  requestsLimit?: number;
  returnsLimit?: number;
  categoriesLimit?: number;
  goodsLimit?: number;
  usersLimit?: number;
  couponsLimit?: number;
  messagesLimit?: number;
  blackListEmailsLimit?: number;
  newsletterEmailsLimit?: number;
  ordersLimit?: number;
  addressesLimit?: number;
  paymentMethodsLimit?: number;
  returnedGoodsLimit?: number;
}
