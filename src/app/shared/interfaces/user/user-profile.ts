import { IMyDate } from 'angular-mydatepicker';
import { CountryDropDown } from 'src/app/shared/interfaces/country-drop-down';

export interface UserProfile {
  id?: string;
  seqNo?: number;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  userName?: string;
  email?: string;
  registrationDate?: string;
  country?: CountryDropDown;
  birthDate?: IMyDate;
  gender?: string;
  profilePicture?: {
    url: string;
    exifOrientation: number;
  };
  isAdmin?: boolean;
  providerId?: string;
}
