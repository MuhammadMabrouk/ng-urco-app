import { trigger, transition, query, useAnimation } from '@angular/animations';
import { fadeOutDownStaggerAnimation } from './fade-down-stagger';


// fade-out-down-stagger-bind trigger
// ----------------------------------
// fade-out-down when binding to the page
export const fadeOutDownStaggerBind = trigger('fadeOutDownStaggerBind', [
  transition('* => *', [
    query(':leave', [
      useAnimation(fadeOutDownStaggerAnimation)
    ], { optional: true })
  ])
]);
