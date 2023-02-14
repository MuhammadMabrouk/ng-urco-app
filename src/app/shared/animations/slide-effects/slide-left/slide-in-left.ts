import { trigger, transition, useAnimation } from '@angular/animations';
import { slideInLeftAnimation } from './slide-left';


// slide-in-left trigger
// ---------------------
export const slideInLeft = trigger('slideInLeft', [
  transition(':enter', useAnimation(slideInLeftAnimation))
]);
