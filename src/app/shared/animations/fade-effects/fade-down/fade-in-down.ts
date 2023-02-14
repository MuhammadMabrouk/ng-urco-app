import { trigger, transition, group, style, animate, animation, useAnimation } from '@angular/animations';
import { fadeInAnimation } from '../fade/fade';


// --------------------- //
//  fade-in-down effect  //
// --------------------- //

// fade-in-down animation
export const fadeInDownAnimation = animation(
  group([
    style({ transform: 'translateY(-30px)' }),
    animate('{{ duration }} {{ easing }}'),
    useAnimation(fadeInAnimation)
  ]),

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-out'
  }}
);


// fade-in-down trigger
// --------------------
export const fadeInDown = trigger('fadeInDown', [
  transition(':enter', useAnimation(fadeInDownAnimation))
]);
