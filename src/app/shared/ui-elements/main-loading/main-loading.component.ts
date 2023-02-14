import { Component } from '@angular/core';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';

@Component({
  selector: 'app-main-loading',
  templateUrl: './main-loading.component.html',
  styleUrls: ['./main-loading.component.scss']
})
export class MainLoadingComponent {

  constructor(public mainLoadingSer: MainLoadingService) { }
}
