import { trigger, transition, query, useAnimation, animateChild } from '@angular/animations';
import { fadeInUpStaggerAnimation } from './fade-up-stagger';


// fade-in-up-stagger-bind trigger
// -------------------------------
// fade-in-up when binding to the page
export const fadeInUpStaggerBind = trigger('fadeInUpStaggerBind', [
  transition('* => *', [
    query(':enter', [
      useAnimation(fadeInUpStaggerAnimation)
    ], { optional: true }),

    // trigger children animations
    query('@*', animateChild(), { optional: true })
  ])
]);
