import { Directive, OnInit, Input, ElementRef, Renderer2, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Directive({
  selector: '[appMenuToggleButton]'
})
export class MenuToggleButtonDirective implements OnInit {

  @Input('appMenuToggleButton') dropDownMenu: HTMLElement;
  @Input('bodyClass') bodyClass: string;
  @Input('closeOnNavigate') closeOnNavigate: boolean;

  bodyElement = this.render.selectRootElement('body', true);

  // flag to toggle the menu
  isMenuOpen: boolean = false;

  constructor(
    private elRef: ElementRef,
    private render: Renderer2,
    private router: Router
  ) { }

  // toggle the menu on click
  @HostListener('click', ['$event']) onClick() {
    this.isMenuOpen = !this.isMenuOpen;

    this.isMenuOpen ? this.openMenu() : this.closeMenu();
  }

  ngOnInit() {
    // close the menu on navigate
    this.closeMenuOnNavigate();

    // close the menu on click outside
    this.closeMenuOnClickOutside();
  }

  // close the menu on navigate
  closeMenuOnNavigate() {
    if (this.closeOnNavigate) {
      this.router.events.subscribe(val => {
        if (val instanceof NavigationEnd) {
          this.closeMenu();
          this.isMenuOpen = false;
        }
      });
    }
  }

  // close the menu on click outside
  closeMenuOnClickOutside() {
    this.render.listen('window', 'click', (event: Event) => {
      if (
        !this.elRef.nativeElement.contains(event.target) &&
        !this.dropDownMenu.contains(event.target as Node)
      ) {
        this.closeMenu();
        this.isMenuOpen = false;
      }
    });
  }

  // open the menu
  openMenu() {
    this.render.addClass(this.elRef.nativeElement, 'open'); // add class 'open' to the menu button
    this.render.addClass(this.dropDownMenu, 'open'); // add class 'open' to the menu itself
    // add a class to the body
    if (this.bodyClass) {
      this.render.addClass(this.bodyElement, this.bodyClass);
    }
  }

  // close the menu
  closeMenu() {
    this.render.removeClass(this.elRef.nativeElement, 'open'); // remove class 'open' from the menu button
    this.render.removeClass(this.dropDownMenu, 'open'); // remove class 'open' from the menu itself
    // remove the added class from the body
    if (this.bodyClass) {
      this.render.removeClass(this.bodyElement, this.bodyClass);
    }
  }
}
