import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss']
})
export class InputNumberComponent {

  @Input() value: any;

  @Output() valueChange = new EventEmitter();

  constructor() { }

  valueDecrease(value: number) {
    if (value > 1) {
      this.value = +value - 1;
    }
    this.valueChange.emit(this.value);
  }

  valueIncrease(value: number) {
    this.value = +value + 1;
    this.valueChange.emit(this.value);
  }

  sendValue(value: any) {
    this.valueChange.emit(value);
  }

}
