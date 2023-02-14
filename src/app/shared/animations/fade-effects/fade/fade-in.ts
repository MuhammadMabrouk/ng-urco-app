import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeInAnimation } from './fade';


// fade-in trigger
// ---------------
export const fadeIn = trigger('fadeIn', [
  transition(':enter', useAnimation(fadeInAnimation))
]);
