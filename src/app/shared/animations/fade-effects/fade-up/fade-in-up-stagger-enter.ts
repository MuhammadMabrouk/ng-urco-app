import { trigger, transition, query, useAnimation } from '@angular/animations';
import { fadeInUpStaggerAnimation } from './fade-up-stagger';


// fade-in-up-stagger-enter trigger
// --------------------------------
// fade-in-up when entering the page
export const fadeInUpStaggerEnter = trigger('fadeInUpStaggerEnter', [
  transition(':enter', [

    // you must add this class to target children
    query('.fadeInUpStagger', [
      useAnimation(fadeInUpStaggerAnimation)
    ], { optional: true })
  ])
]);
