import { trigger, transition, useAnimation } from '@angular/animations';
import { slideFadeInAnimation } from './slide-fade';


// slide & fade down trigger
// -------------------------
export const slideFadeDown = trigger('slideFadeDown', [
  transition(':enter', useAnimation(slideFadeInAnimation))
]);
