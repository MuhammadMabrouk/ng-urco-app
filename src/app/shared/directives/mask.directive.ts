import { Directive, Input, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appMask]'
})
export class MaskDirective {

  @Input() set appMask(value) {
    this.regExpr = new RegExp(value);
  }

  oldValue: string = '';
  regExpr: any;

  constructor(@Optional() private control: NgControl) { }

  @HostListener('input', ['$event']) change($event) {

    const item = $event.target;
    const value = item.value;
    let pos = item.selectionStart;
    const matchValue = value;
    const noMatch: boolean = value && !this.regExpr.test(matchValue);

    if (noMatch) {
      item.selectionStart = item.selectionEnd = pos - 1;
      if (item.value.length < this.oldValue.length && pos === 0) {
        pos = 2;
      }
      if (this.control) {
        this.control.control.setValue(this.oldValue, { emit: false });
      }

      item.value = this.oldValue;
      item.selectionStart = item.selectionEnd = pos - 1;
    } else {
      this.oldValue = value;
    }
  }
}
