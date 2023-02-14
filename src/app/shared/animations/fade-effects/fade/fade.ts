import { trigger, transition, style, animate, animation, useAnimation } from '@angular/animations';


// ------------- //
//  fade effect  //
// ------------- //

// fade-in animation
export const fadeInAnimation = animation([
  style({ opacity: 0 }),
  animate('{{ duration }} {{ easing }}')],

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-out'
  }}
);

// fade-out animation
export const fadeOutAnimation = animation(
  animate('{{ duration }} {{ easing }}',
    style({ opacity: 0 })
  ),

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-in'
  }}
);

// fade trigger
// ------------
export const fade = trigger('fade', [
  transition(':enter', useAnimation(fadeInAnimation)),
  transition(':leave', useAnimation(fadeOutAnimation))
]);
