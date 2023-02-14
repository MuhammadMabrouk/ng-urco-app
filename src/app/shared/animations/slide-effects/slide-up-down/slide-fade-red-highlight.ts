import { trigger, transition, group, style, animate, useAnimation } from '@angular/animations';
import { slideFadeInAnimation, slideFadeOutAnimation } from './slide-fade';


/* disappear with red highlight */

// slide & fade red highlight trigger
// ----------------------------------
export const slideFadeRedHighlight = trigger('slideFadeRedHighlight', [

  transition(':enter', useAnimation(slideFadeInAnimation)),

  transition(':leave', group([
    style({ backgroundColor: 'red' }),
    animate('.4s'),
    useAnimation(slideFadeOutAnimation)
  ]))

]);
