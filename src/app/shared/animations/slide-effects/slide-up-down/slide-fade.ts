import { trigger, transition, style, animate, sequence, animation, useAnimation } from '@angular/animations';


// --------------------- //
//  slide & fade effect  //
// --------------------- //

// slide & fade in animation
export const slideFadeInAnimation = animation([
  style({ height: '0', opacity: '0' }),
  sequence([

    animate('{{ firstStepDuration }} {{ firstStepEasing }}',
      style({ height: '*', opacity: '.2' })
    ),

    animate('{{ secondStepDuration }} {{ secondStepEasing }}',
      style({ height: '*', opacity: 1 })
    )

  ])],

  // options parameters
  { params: {
    firstStepDuration: '.2s',
    firstStepEasing: 'ease',
    secondStepDuration: '.4s',
    secondStepEasing: 'ease'
  }}
);

// slide & fade out animation
export const slideFadeOutAnimation = animation(
  sequence([

    animate('{{ firstStepDuration }} {{ firstStepEasing }}',
      style({ height: '*', opacity: '.2' })
    ),

    animate('{{ secondStepDuration }} {{ secondStepEasing }}',
      style({ height: '0', opacity: 0 })
    )

  ]),

  // options parameters
  { params: {
    firstStepDuration: '.2s',
    firstStepEasing: 'ease',
    secondStepDuration: '.2s',
    secondStepEasing: 'ease'
  }}
);


// slide & fade trigger
// --------------------
export const slideFade = trigger('slideFade', [
  transition(':enter', useAnimation(slideFadeInAnimation)),
  transition(':leave', useAnimation(slideFadeOutAnimation))
]);
