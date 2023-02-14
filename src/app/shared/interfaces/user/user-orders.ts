import { CountryDropDown } from 'src/app/shared/interfaces/country-drop-down';

export interface UserOrders {
  id?: string;
  seqNo?: number;
  placedDate?: string;
  placedTime?: string;
  deliveredDate?: string;
  address?: string;
  status?: 'ordered' | 'confirmed' | 'shipped' | 'delivered' | 'canceled' | 'returned';
  total?: number;

  // customer info
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerCountry?: CountryDropDown | string;
  customerGender?: string;
}
