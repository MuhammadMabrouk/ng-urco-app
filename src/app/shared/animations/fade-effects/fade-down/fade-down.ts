import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeInDownAnimation } from './fade-in-down';
import { fadeOutDownAnimation } from './fade-out-down';


// fade-down trigger
// -----------------
export const fadeDown = trigger('fadeDown', [
  transition(':enter', useAnimation(fadeInDownAnimation)),
  transition(':leave', useAnimation(fadeOutDownAnimation))
]);
