import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating-view',
  templateUrl: './star-rating-view.component.html',
  styleUrls: ['./star-rating-view.component.scss']
})
export class StarRatingViewComponent {

  @Input() ratingClass: 1 | 2 | 3 | 4 | 5;
}
