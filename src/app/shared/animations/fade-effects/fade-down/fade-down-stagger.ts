import { trigger, query, transition, style, stagger, animate, animation, useAnimation } from '@angular/animations';


// --------------------- //
//  fade stagger effect  //
// --------------------- //

// fade-in-down-stagger animation
export const fadeInDownStaggerAnimation = animation([
  style({
    opacity: 0,
    transform: 'translateY(-30px)'
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

// fade-out-down-stagger animation
export const fadeOutDownStaggerAnimation = animation([
  stagger('.1s',
    animate('{{ duration }} {{ easing }}',
      style({
        opacity: 0,
        transform: 'translateY(30px)'
      })
    )
  )],

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-in'
  }}
);


// fade-down-stagger-enter trigger
// -------------------------------
// fade-down when entering the page
export const fadeDownStaggerEnter = trigger('fadeDownStaggerEnter', [

  transition(':enter', [
    // you must add this class to target children
    query('.fadeDownStagger', [
      useAnimation(fadeInDownStaggerAnimation)
    ], { optional: true })
  ]),

  transition(':leave', [
    // you must add this class to target children
    query('.fadeDownStagger', [
      useAnimation(fadeOutDownStaggerAnimation)
    ], { optional: true })
  ]),

]);


// fade-down-stagger-bind trigger
// ------------------------------
// fade-down when binding to the page
export const fadeDownStaggerBind = trigger('fadeDownStaggerBind', [
  transition('* => *', [

    query(':enter', [
      useAnimation(fadeInDownStaggerAnimation)
    ], { optional: true }),

    query(':leave', [
      useAnimation(fadeOutDownStaggerAnimation)
    ], { optional: true })

  ])
]);
