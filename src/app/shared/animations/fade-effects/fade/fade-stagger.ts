import { trigger, query, transition, style, stagger, animate, animation, useAnimation } from '@angular/animations';


// --------------------- //
//  fade stagger effect  //
// --------------------- //

// fade-in-stagger animation
export const fadeInStaggerAnimation = animation([
  style({ opacity: 0 }),
  stagger('.1s',
    animate('{{ duration }} {{ easing }}')
  )],

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-out'
  }}
);

// fade-out-stagger animation
export const fadeOutStaggerAnimation = animation([
  stagger('.1s',
    animate('{{ duration }} {{ easing }}',
      style({ opacity: 0 })
    )
  )],

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-in'
  }}
);


// fade-stagger-enter trigger
// --------------------------
// fade when entering the page
export const fadeStaggerEnter = trigger('fadeStaggerEnter', [

  transition(':enter', [
    // you must add this class to target children
    query('.fadeStagger', [
      useAnimation(fadeInStaggerAnimation)
    ], { optional: true })
  ]),

  transition(':leave', [
    // you must add this class to target children
    query('.fadeStagger', [
      useAnimation(fadeOutStaggerAnimation)
    ], { optional: true })
  ]),

]);


// fade-stagger-bind trigger
// -------------------------
// fade when binding to the page
export const fadeStaggerBind = trigger('fadeStaggerBind', [
  transition('* => *', [

    query(':enter', [
      useAnimation(fadeInStaggerAnimation)
    ], { optional: true }),

    query(':leave', [
      useAnimation(fadeOutStaggerAnimation)
    ], { optional: true })

  ])
]);
