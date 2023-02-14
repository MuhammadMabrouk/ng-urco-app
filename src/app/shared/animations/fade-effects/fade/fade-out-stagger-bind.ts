import { trigger, transition, query, useAnimation } from '@angular/animations';
import { fadeOutStaggerAnimation } from './fade-stagger';


// fade-out-stagger-bind trigger
// -----------------------------
// fade-out when binding to the page
export const fadeOutStaggerBind = trigger('fadeOutStaggerBind', [
  transition('* => *', [
    query(':leave', [
      useAnimation(fadeOutStaggerAnimation)
    ], { optional: true })
  ])
]);
