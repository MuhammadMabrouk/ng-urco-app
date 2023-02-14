import { Directive, OnInit, OnDestroy, Input, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appCharRemaining]'
})
export class CharRemainingDirective implements OnInit, OnDestroy {

  @Input('appCharRemaining') charCountView: HTMLElement;

  // for unsubscribe when directive destroyed
  valueChangesObservable: Subscription;

  constructor(
    private control: NgControl,
    private render: Renderer2
  ) { }

  ngOnInit() {
    // count and display number of remaining characters
    this.valueChangesObservable = this.control.control.valueChanges.subscribe(value => {
      this.render.setProperty(this.charCountView, 'innerHTML', value ? value.length : 0);
    });
  }

  ngOnDestroy() {
    // prevent memory leak when directive destroyed
    this.valueChangesObservable.unsubscribe();
  }
}
