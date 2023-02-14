import { trigger, transition, query, useAnimation, animateChild } from '@angular/animations';
import { fadeInStaggerAnimation } from './fade-stagger';


// fade-in-stagger-bind trigger
// ----------------------------
// fade-in when binding to the page
export const fadeInStaggerBind = trigger('fadeInStaggerBind', [
  transition('* => *', [
    query(':enter', [
      useAnimation(fadeInStaggerAnimation)
    ], { optional: true }),

    // trigger children animations
    query('@*', animateChild(), { optional: true })
  ])
]);
