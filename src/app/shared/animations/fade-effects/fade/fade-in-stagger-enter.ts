import { trigger, transition, query, useAnimation } from '@angular/animations';
import { fadeInStaggerAnimation } from './fade-stagger';


// fade-in-stagger-enter trigger
// -----------------------------
// fade-in when entering the page
export const fadeInStaggerEnter = trigger('fadeInStaggerEnter', [
  transition(':enter', [

    // you must add this class to target children
    query('.fadeInStagger', [
      useAnimation(fadeInStaggerAnimation)
    ], { optional: true })
  ])
]);
