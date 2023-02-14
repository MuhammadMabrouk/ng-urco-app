import { trigger, transition, query, useAnimation } from '@angular/animations';
import { fadeOutStaggerAnimation } from './fade-stagger';


// fade-out-stagger-enter trigger
// ------------------------------
// fade-out when entering the page
export const fadeOutStaggerEnter = trigger('fadeOutStaggerEnter', [
  transition(':leave', [

    // you must add this class to target children
    query('.fadeOutStagger', [
      useAnimation(fadeOutStaggerAnimation)
    ], { optional: true })
  ])
]);
