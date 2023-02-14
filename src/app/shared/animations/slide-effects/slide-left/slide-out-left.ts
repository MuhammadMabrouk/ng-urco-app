import { trigger, transition, useAnimation } from '@angular/animations';
import { slideOutLeftAnimation } from './slide-left';


// slide-out-left trigger
// ----------------------
export const slideOutLeft = trigger('slideOutLeft', [
  transition(':leave', useAnimation(slideOutLeftAnimation))
]);
