import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// animations
import { routingFadeInUp } from 'src/app/shared/animations/fade-effects/fade-up/routing-fade-in-up';

@Component({
  selector: 'app-admin-viewport',
  templateUrl: './admin-viewport.component.html',
  styleUrls: ['./admin-viewport.component.scss'],
  animations: [routingFadeInUp]
})
export class AdminViewportComponent {

  // detect when a view changes
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
}
