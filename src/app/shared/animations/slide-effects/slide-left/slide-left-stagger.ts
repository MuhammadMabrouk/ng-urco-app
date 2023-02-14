import { trigger, query, transition, style, stagger, animate, animation, useAnimation } from '@angular/animations';


// --------------------------- //
//  slide-left stagger effect  //
// --------------------------- //

// slide-in-left-stagger animation
export const slideInLeftStaggerAnimation = animation([
  style({
    opacity: '0',
    transform: 'translateX(100%)'
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

// slide-out-left-stagger animation
export const slideOutLeftStaggerAnimation = animation([
  stagger('.1s',
    animate('{{ duration }} {{ easing }}',
      style({
        opacity: '0',
        transform: 'translateX(-100%)'
      })
    )
  )],

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-in'
  }}
);


// slide-left-stagger-enter trigger
// --------------------------------
// slide-left when entering the page
export const slideLeftStaggerEnter = trigger('slideLeftStaggerEnter', [

  transition(':enter', [
    // you must add this class to target children
    query('.slideLeftStagger', [
      useAnimation(slideInLeftStaggerAnimation)
    ], { optional: true })
  ]),

  transition(':leave', [
    // you must add this class to target children
    query('.slideLeftStagger', [
      useAnimation(slideOutLeftStaggerAnimation)
    ], { optional: true })
  ])

]);


// slide-left-stagger-bind trigger
// -------------------------------
// slide-left when binding to the page
export const slideLeftStaggerBind = trigger('slideLeftStaggerBind', [
  transition('* => *', [

    query(':enter', [
      useAnimation(slideInLeftStaggerAnimation)
    ], { optional: true }),

    query(':leave', [
      useAnimation(slideOutLeftStaggerAnimation)
    ], { optional: true })

  ])
]);
