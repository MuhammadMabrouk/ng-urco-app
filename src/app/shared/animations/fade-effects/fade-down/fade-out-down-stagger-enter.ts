import { trigger, transition, query, useAnimation } from '@angular/animations';
import { fadeOutDownStaggerAnimation } from './fade-down-stagger';


// fade-out-down-stagger-enter trigger
// -----------------------------------
// fade-out-down when entering the page
export const fadeOutDownStaggerEnter = trigger('fadeOutDownStaggerEnter', [
  transition(':leave', [

    // you must add this class to target children
    query('.fadeOutDownStagger', [
      useAnimation(fadeOutDownStaggerAnimation)
    ], { optional: true })
  ])
]);
