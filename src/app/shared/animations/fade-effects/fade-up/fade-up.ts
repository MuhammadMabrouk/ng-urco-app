import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeInUpAnimation } from './fade-in-up';
import { fadeOutUpAnimation } from './fade-out-up';


// fade-up trigger
// ---------------
export const fadeUp = trigger('fadeUp', [
  transition(':enter', useAnimation(fadeInUpAnimation)),
  transition(':leave', useAnimation(fadeOutUpAnimation))
]);
