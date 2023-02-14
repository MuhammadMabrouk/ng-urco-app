import { Component, OnInit, ViewChild, Input, Output, EventEmitter, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { GoodsService } from 'src/app/shared/services/goods/goods.service';
import { StarRatingComponent } from 'src/app/shared/ui-elements/star-rating/star-rating.component';

@Component({
  selector: 'app-review-model',
  templateUrl: './review-model.component.html',
  styleUrls: ['./review-model.component.scss']
})
export class ReviewModelComponent implements OnInit {

  // get 'StarRating' component to access its form and reset it
  @ViewChild('ratingComponent') ratingComponent: StarRatingComponent;

  // flag to toggle the modal
  // tslint:disable-next-line: variable-name
  private _isOpen: boolean;

  @Input() set isOpen(value: boolean) {
    this._isOpen = value;

    const bodyElement = this.render.selectRootElement('body', true);

    if (value) { this.render.setStyle(bodyElement, 'overflowY', 'hidden');
    } else { this.render.setStyle(bodyElement, 'overflowY', ''); }
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  // get the modal title
  @Input() modalTitle: string = 'Modal title';

  // permission to the parent component to close the modal
  @Output() cancelEvent = new EventEmitter();

  // good review form
  reviewForm: FormGroup;
  // good rating form controls validators
  commentMinLength: number = 15;
  // good rating value
  ratingValue: number;

  constructor(
    private translateSer: TranslateService,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    private fb: FormBuilder,
    private validatorsSer: FormsValidatorsService,
    private render: Renderer2,
    private goodsSer: GoodsService,
  ) { }

  ngOnInit() {
    // good review form
    this.reviewForm = this.fb.group({
      goodId: [null, Validators.required],
      rating: [null, Validators.required],
      comment: [null, Validators.minLength(this.commentMinLength)]
    }, {
      validator: [
        // comment minlength validation
        this.validatorsSer.anyMinLength(
          'comment',
          this.translateSer.instant('custom-elements.review-model.comment.your-comment'),
          this.commentMinLength
        )
      ]
    });
  }

  // get good rating value
  getRateValue(value: string) {
    this.ratingValue = +value;
    this.reviewForm.patchValue({ rating: value });
  }

  // show the review modal for this good
  productReview(goodId: string) {
    this.mainLoadingSer.startLoading();

    // set the good id in review form values
    this.reviewForm.patchValue({ goodId });

    // get current user review for this good
    this.goodsSer.getUserReviewForThisGood(goodId)
      .then(data => {
        if (data) {
          // set rating value to display the label in the template
          this.ratingValue = data.rating;

          // pass rating value to 'StarRatingComponent'
          this.ratingComponent.ratingForm.patchValue({ rating: data.rating });
          this.reviewForm.patchValue({
            rating: data.rating,
            comment: data.comment
          });
        }

        this.mainLoadingSer.endLoading();
      })
      .catch(() => this.mainLoadingSer.endLoading());
  }

  // send good review to the database
  sendReview(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    this.goodsSer.addGoodReview(form.getRawValue())
      .then(() => {

        // get all rates of this good
        this.goodsSer.getGoodAllRates(form.getRawValue().goodId)
          .then(data => {
            // create array from all rates
            const allRates = data.map(rate => rate.rating);

            // count duplicate values in 'allRates' array
            const starsCount = {};
            allRates.forEach(rate => { starsCount[rate] = (starsCount[rate] || 0) + 1; });

            // create array from duplicate values count
            const starsCountValues: number[] = [
              starsCount['1'] ? starsCount['1'] : 0,
              starsCount['2'] ? starsCount['2'] : 0,
              starsCount['3'] ? starsCount['3'] : 0,
              starsCount['4'] ? starsCount['4'] : 0,
              starsCount['5'] ? starsCount['5'] : 0
            ];

            // calculate rating score to number
            let count = 0;
            let sum = 0;
            starsCountValues.forEach((value, index) => {
              count += value;
              sum += value * (index + 1);
            }, 0);
            const score = Math.round(sum / count);

            // update rating score of this good
            this.goodsSer.updateGoodRating(form.getRawValue().goodId, score);

            this.cancelEvent.emit(); // close the modal
            this.ratingValue = undefined; // reset rating value
            form.reset();
            this.ratingComponent.ratingForm.reset(); // reset rating form in 'StarRatingComponent'

            this.mainLoadingSer.endLoading();
            this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.thanks-for-feedback'), time: 5000});
          })
          .catch(() => {
            this.mainLoadingSer.endLoading();
            this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
          });
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
      });
  }

  // close the modal
  closeModal() {
    this.cancelEvent.emit(); // close the modal
    this.ratingValue = undefined; // reset rating value
    this.reviewForm.reset();
    this.ratingComponent.ratingForm.reset(); // reset rating form in 'StarRatingComponent'
  }
}
