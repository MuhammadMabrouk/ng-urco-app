import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent implements OnInit {

  // send rate value when user clicks stars
  @Output() rate = new EventEmitter();

  // rating form
  ratingForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    // rating form
    this.ratingForm = this.fb.group({
      rating: [null, Validators.required]
    });
  }

  // send rate value to the parent component
  sendRate(value: string) {
    this.rate.emit(value);
  }
}
