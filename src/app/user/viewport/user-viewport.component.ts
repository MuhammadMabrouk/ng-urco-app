import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// animations
import { routingFadeInUp } from 'src/app/shared/animations/fade-effects/fade-up/routing-fade-in-up';

@Component({
  selector: 'app-user-viewport',
  templateUrl: './user-viewport.component.html',
  styleUrls: ['./user-viewport.component.scss'],
  animations: [routingFadeInUp]
})
export class UserViewportComponent {

  // detect when a view changes
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
}
