import { trigger, transition, useAnimation } from '@angular/animations';
import { fadeOutAnimation } from './fade';


// fade-out trigger
// ----------------
export const fadeOut = trigger('fadeOut', [
  transition(':leave', useAnimation(fadeOutAnimation))
]);
