import { trigger, transition, style, animate, animation, useAnimation } from '@angular/animations';

const voidStyle = {
  height: 0,
  marginTop: 0,
  opacity: 0,
  overflow: 'hidden'
};

// slide-down animation
export const slideDownAnimation = animation([
  style(voidStyle),
  animate('{{ duration }} {{ easing }}')
],

// options parameters
{ params: {
  duration: '.3s',
  easing: 'ease-in-out'
}});

// slide-up animation
export const slideUpAnimation = animation(
  animate('{{ duration }} {{ easing }}', style(voidStyle)),

  // options parameters
  { params: {
    duration: '.3s',
    easing: 'ease-in-out'
  }}
);


// slide-toggle trigger
// --------------------
export const slideToggle = trigger('slideToggle', [
  transition(':enter', useAnimation(slideDownAnimation)),
  transition(':leave', useAnimation(slideUpAnimation))
]);
