import { trigger, transition, group, style, animate, useAnimation, state } from '@angular/animations';
import { slideFadeOutAnimation } from './slide-fade';


/* disappear with red highlight */

// slide & fade up red highlight trigger
// -------------------------------------
export const slideFadeUpRedHighlight = trigger('slideFadeUpRedHighlight', [
  transition(':leave',
    group([
      style({ backgroundColor: 'red' }),
      animate('.4s'),
      useAnimation(slideFadeOutAnimation)
    ])
  )
]);

// slide & fade up red highlight state trigger
// -------------------------------------------
export const slideFadeUpRedHighlightState = trigger('slideFadeUpRedHighlightState', [
  state('out',
    style({
      height: '0',
      minHeight: 'auto',
      padding: 0,
      opacity: 0,
      overflow: 'hidden'
    })
  ),

  transition('in => out', [
    style({ backgroundColor: 'red' }),
    animate('.4s ease-in'),
    useAnimation(slideFadeOutAnimation)
  ])
]);
