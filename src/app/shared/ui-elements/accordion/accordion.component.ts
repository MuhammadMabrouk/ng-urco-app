import { Component, OnInit, Input } from '@angular/core';
import { Accordion } from 'src/app/shared/ui-elements/accordion/accordion';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements OnInit {

  // tslint:disable-next-line: variable-name
  private _accordionItems: Accordion[];

  @Input() set accordionItems(items: Accordion[]) {
    this._accordionItems = items;
  }

  get accordionItems(): Accordion[] {
    return this._accordionItems;
  }

  constructor() { }

  ngOnInit() {
  }

  // show and hide show accordion content
  showAccordionContent(el) {
    $(el.currentTarget).siblings('.content').slideToggle();
    $(el.currentTarget).parent('.card').siblings().find('.content').slideUp();

    $(el.currentTarget).parent('.card').toggleClass('active');
    $(el.currentTarget).parent('.card').siblings().removeClass('active');
  }
}
