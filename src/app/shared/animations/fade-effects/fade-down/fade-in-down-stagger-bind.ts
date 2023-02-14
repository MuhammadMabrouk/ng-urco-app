import { trigger, transition, query, useAnimation, animateChild } from '@angular/animations';
import { fadeInDownStaggerAnimation } from './fade-down-stagger';


// fade-in-down-stagger-bind trigger
// ---------------------------------
// fade-in-down when binding to the page
export const fadeInDownStaggerBind = trigger('fadeInDownStaggerBind', [
  transition('* => *', [
    query(':enter', [
      useAnimation(fadeInDownStaggerAnimation)
    ], { optional: true }),

    // trigger children animations
    query('@*', animateChild(), { optional: true })
  ])
]);
