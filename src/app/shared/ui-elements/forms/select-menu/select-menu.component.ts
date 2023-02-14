import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { SelectMenu } from 'src/app/shared/ui-elements/forms/select-menu/select-menu';

// animations
import { fadeIn } from 'src/app/shared/animations/fade-effects/fade/fade-in';

@Component({
  selector: 'app-select-menu',
  templateUrl: './select-menu.component.html',
  styleUrls: ['./select-menu.component.scss'],
  animations: [fadeIn],
  host: {
    '(document:click)': 'clickOutside($event)'
  }
})

export class SelectMenuComponent implements OnInit {

  @ViewChild('menuOptions') menuOptions: ElementRef;

  @Input() modelLabel: string;
  @Input() modelIcon: string;
  @Input() ltrOnly: boolean;
  @Output() selectChange = new EventEmitter();

  // tslint:disable-next-line: variable-name
  private _options: SelectMenu[];

  @Input() set options(value: SelectMenu[]) {
    this._options = value;
  }

  get options(): SelectMenu[] {
    return this._options;
  }

  // to toggle drop-down menu state
  isOpen: boolean = false;
  // search value to filter the options array
  filterValue: string;

  constructor(private elRef: ElementRef) { }

  ngOnInit() {
    this.modelLabel = this.modelLabel ? this.modelLabel : 'Select...';
    this.modelIcon = this.modelIcon ? this.modelIcon : '';
  }

  // toggle close and open the drop-down menu
  toggleMenu() {
    this.isOpen = !this.isOpen;

    // scroll to the selected item when the menu opens
    const menuContainer = $(this.menuOptions.nativeElement);
    setTimeout(() => {
      if (menuContainer.children('.active').length > 0) {
        menuContainer.scrollTop(
          menuContainer.scrollTop() + (menuContainer.children('.active').offset().top - menuContainer.offset().top)
        );
      }
    }, 0);
  }

  // close the drop-down menu on click outside
  clickOutside(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  // select an option in dropdown menu
  select(index: number, option: SelectMenu) {
    this.modelLabel = option.label;
    this.modelIcon = option.icon;
    this.selectChange.emit(this.options[index]);
    this.toggleMenu();
  }
}
