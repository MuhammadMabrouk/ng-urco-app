import { trigger, transition, group, style, animate, animation, useAnimation } from '@angular/animations';
import { fadeOutAnimation } from '../fade/fade';


// -------------------- //
//  fade-out-up effect  //
// -------------------- //

// fade-out-up animation
export const fadeOutUpAnimation = animation(
  group([
    animate('{{ duration }} {{ easing }}',
      style({ transform: 'translateY(-30px)' })
    ),
    useAnimation(fadeOutAnimation)
  ]),

  // options parameters
  { params: {
    duration: '.4s',
    easing: 'ease-in'
  }}
);


// fade-out-up trigger
// -------------------
export const fadeOutUp = trigger('fadeOutUp', [
  transition(':leave', useAnimation(fadeOutUpAnimation))
]);
