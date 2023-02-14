import { trigger, query, transition, style, stagger, animate, animation, useAnimation } from '@angular/animations';


// --------------------- //
//  fade stagger effect  //
// --------------------- //

// fade-in-up-stagger animation
export const fadeInUpStaggerAnimation = animation([
  style({
    opacity: 0,
    transform: 'translateY(30px)'
  }),
  stagger('.1s',
    animate('{{ duration }} {{ easing }}')
  )],

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-out'
  }}
);

// fade-out-up-stagger animation
export const fadeOutUpStaggerAnimation = animation([
  stagger('.1s',
    animate('{{ duration }} {{ easing }}',
      style({
        opacity: 0,
        transform: 'translateY(-30px)'
      })
    )
  )],

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-in'
  }}
);


// fade-up-stagger-enter trigger
// -----------------------------
// fade-up when entering the page
export const fadeUpStaggerEnter = trigger('fadeUpStaggerEnter', [

  transition(':enter', [
    // you must add this class to target children
    query('.fadeUpStagger', [
      useAnimation(fadeInUpStaggerAnimation)
    ], { optional: true })
  ]),

  transition(':leave', [
    // you must add this class to target children
    query('.fadeUpStagger', [
      useAnimation(fadeOutUpStaggerAnimation)
    ], { optional: true })
  ])

]);


// fade-up-stagger-bind trigger
// ----------------------------
// fade-up when binding to the page
export const fadeUpStaggerBind = trigger('fadeUpStaggerBind', [
  transition('* => *', [

    query(':enter', [
      useAnimation(fadeInUpStaggerAnimation)
    ], { optional: true }),

    query(':leave', [
      useAnimation(fadeOutUpStaggerAnimation)
    ], { optional: true })

  ])
]);
