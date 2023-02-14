import { trigger, transition, useAnimation } from '@angular/animations';
import { slideFadeOutAnimation } from './slide-fade';


// slide & fade up trigger
// -----------------------
export const slideFadeUp = trigger('slideFadeUp', [
  transition(':leave', useAnimation(slideFadeOutAnimation))
]);
