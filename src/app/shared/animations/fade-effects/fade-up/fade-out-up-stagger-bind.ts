import { trigger, transition, query, useAnimation } from '@angular/animations';
import { fadeOutUpStaggerAnimation } from './fade-up-stagger';


// fade-out-up-stagger-bind trigger
// --------------------------------
// fade-out-up when binding to the page
export const fadeOutUpStaggerBind = trigger('fadeOutUpStaggerBind', [
  transition('* => *', [
    query(':leave', [
      useAnimation(fadeOutUpStaggerAnimation)
    ], { optional: true })
  ])
]);
