import { trigger, transition, group, query, style, animate, animateChild } from '@angular/animations';


// routing-slide-left trigger
// --------------------------
export const routingSlideLeft = trigger('routingSlideLeft', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),

    query(':enter', [
      style({ left: '-100%'})
    ], { optional: true }),
    query(':leave', animateChild(), { optional: true }),

    group([
      query(':leave', [
        animate('.4s ease-out', style({ left: '100%'}))
      ], { optional: true }),

      query(':enter', [
        animate('.4s ease-out', style({ left: '0%'}))
      ], { optional: true })
    ]),

    query(':enter', animateChild(), { optional: true })
  ])
]);
