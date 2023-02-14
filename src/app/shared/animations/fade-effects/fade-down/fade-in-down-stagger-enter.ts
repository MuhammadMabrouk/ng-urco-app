import { trigger, transition, query, useAnimation } from '@angular/animations';
import { fadeInDownStaggerAnimation } from './fade-down-stagger';


// fade-in-down-stagger-enter trigger
// ----------------------------------
// fade-in-down when entering the page
export const fadeInDownStaggerEnter = trigger('fadeInDownStaggerEnter', [
  transition(':enter', [

    // you must add this class to target children
    query('.fadeInDownStagger', [
      useAnimation(fadeInDownStaggerAnimation)
    ], { optional: true })
  ])
]);
