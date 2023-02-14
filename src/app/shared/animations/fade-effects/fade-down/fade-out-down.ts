import { trigger, transition, group, style, animate, animation, useAnimation } from '@angular/animations';
import { fadeOutAnimation } from '../fade/fade';


// ---------------------- //
//  fade-out-down effect  //
// ---------------------- //

// fade-out-down animation
export const fadeOutDownAnimation = animation(
  group([
    animate('{{ duration }} {{ easing }}',
      style({ transform: 'translateY(30px)' })
    ),
    useAnimation(fadeOutAnimation)
  ]),

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-in'
  }}
);


// fade-out-down trigger
// ---------------------
export const fadeOutDown = trigger('fadeOutDown', [
  transition(':leave', useAnimation(fadeOutDownAnimation))
]);
