import { Directive, Input, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appFixOrientation]'
})
export class FixOrientationDirective {

  classes: string[] = ['deg270', 'deg180', 'deg90', 'fH-deg0', 'fH-deg270', 'fH-deg180', 'fH-deg90'];

  // tslint:disable-next-line: variable-name
  private _appFixOrientation: number;

  @Input() set appFixOrientation(value: number) {
    this._appFixOrientation = value;

    const img = this.elRef.nativeElement;

    switch (value) {
      case 8:
        this.render.addClass(img, 'deg270');
        for (const i of this.classes) {
          if (i !== 'deg270') { this.render.removeClass(img, i); }
        }
        break;

      case 3:
        this.render.addClass(img, 'deg180');
        for (const i of this.classes) {
          if (i !== 'deg180') { this.render.removeClass(img, i); }
        }
        break;

      case 6:
        this.render.addClass(img, 'deg90');
        for (const i of this.classes) {
          if (i !== 'deg90') { this.render.removeClass(img, i); }
        }
        break;

      case 2:
        this.render.addClass(img, 'fH-deg0');
        for (const i of this.classes) {
          if (i !== 'fH-deg0') { this.render.removeClass(img, i); }
        }
        break;

      case 7:
        this.render.addClass(img, 'fH-deg270');
        for (const i of this.classes) {
          if (i !== 'fH-deg270') { this.render.removeClass(img, i); }
        }
        break;

      case 4:
        this.render.addClass(img, 'fH-deg180');
        for (const i of this.classes) {
          if (i !== 'fH-deg180') { this.render.removeClass(img, i); }
        }
        break;

      case 5:
        this.render.addClass(img, 'fH-deg90');
        for (const i of this.classes) {
          if (i !== 'fH-deg90') { this.render.removeClass(img, i); }
        }
        break;

      default:
        for (const i of this.classes) {
          this.render.removeClass(img, i);
        }
    }
  }

  get appFixOrientation(): number {
    return this._appFixOrientation;
  }

  constructor(private elRef: ElementRef, private render: Renderer2) { }
}
