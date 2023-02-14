import { trigger, transition, query, useAnimation } from '@angular/animations';
import { fadeOutUpStaggerAnimation } from './fade-up-stagger';


// fade-out-up-stagger-enter trigger
// ---------------------------------
// fade-out-up when entering the page
export const fadeOutUpStaggerEnter = trigger('fadeOutUpStaggerEnter', [
  transition(':leave', [

    // you must add this class to target children
    query('.fadeOutUpStagger', [
      useAnimation(fadeOutUpStaggerAnimation)
    ], { optional: true })
  ])
]);
