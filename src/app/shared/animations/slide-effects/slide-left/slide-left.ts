import { trigger, transition, style, animate, animation, useAnimation } from '@angular/animations';


// ------------------- //
//  slide-left effect  //
// ------------------- //

// slide-in-left animation
export const slideInLeftAnimation = animation([
  style({
    opacity: '0',
    transform: 'translateX(100%)'
  }),
  animate('{{ duration }} {{ easing }}')],

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-out'
  }}
);

// slide-out-left animation
export const slideOutLeftAnimation = animation(
  animate('{{ duration }} {{ easing }}',
    style({
      opacity: '0',
      transform: 'translateX(-100%)'
    })
  ),

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-in'
  }}
);


// slide-left trigger
// ------------------
export const slideLeft = trigger('slideLeft', [
  transition(':enter', useAnimation(slideInLeftAnimation)),
  transition(':leave', useAnimation(slideOutLeftAnimation))
]);
