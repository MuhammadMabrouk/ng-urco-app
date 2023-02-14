import { Component, Output, EventEmitter } from '@angular/core';
import { SimplePaginationService } from 'src/app/shared/ui-elements/simple-pagination/simple-pagination.service';

@Component({
  selector: 'app-simple-pagination',
  templateUrl: './simple-pagination.component.html',
  styleUrls: ['./simple-pagination.component.scss']
})
export class SimplePaginationComponent {

  // to get prev & next pages
  @Output() callPrev = new EventEmitter();
  @Output() callNext = new EventEmitter();

  constructor(public simplePaginationSer: SimplePaginationService) { }

  // get prev page
  getPrevPage() {
    this.callPrev.emit();
  }

  // get next page
  getNextPage() {
    this.callNext.emit();
  }
}
