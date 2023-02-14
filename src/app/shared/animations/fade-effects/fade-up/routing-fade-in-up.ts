import { trigger, transition, query, style, animate, animateChild } from '@angular/animations';


// routing-fade-in-up trigger
// --------------------------
export const routingFadeInUp = trigger('routingFadeInUp', [
  transition('* <=> *', [
    // Set a default style for parent
    style({ position: 'relative' }),

    // Set a default style for enter and leave
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        opacity: 0,
        transform: 'translateY(100px)',
      }),
    ], { optional: true }),

    // Animate the new page in
    query(':enter', [
      animate('.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
    ], { optional: true }),

    // trigger children animations
    query('@*', animateChild(), { optional: true })
  ])
]);
