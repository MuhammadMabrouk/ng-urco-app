import { trigger, transition, group, style, animate, animation, useAnimation } from '@angular/animations';
import { fadeInAnimation } from '../fade/fade';


// ------------------- //
//  fade-in-up effect  //
// ------------------- //

// fade-in-up animation
export const fadeInUpAnimation = animation(
  group([
    style({ transform: 'translateY(30px)' }),
    animate('{{ duration }} {{ easing }}'),
    useAnimation(fadeInAnimation)
  ]),

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-out'
  }}
);


// fade-in-up trigger
// ------------------
export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', useAnimation(fadeInUpAnimation))
]);
