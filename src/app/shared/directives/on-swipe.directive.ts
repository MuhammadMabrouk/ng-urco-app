import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnSwipe]'
})
export class OnSwipeDirective {

  @Output('appOnSwipe') swipeEvent = new EventEmitter();

  swipeCoords: [number, number];
  swipeTime: number;

  constructor() { }

  @HostListener('touchstart', ['$event']) onTouchStart(e: TouchEvent) {
    this.swipeCoords = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    this.swipeTime = new Date().getTime();
  }

  @HostListener('touchend', ['$event']) onTouchEnd(e: TouchEvent) {

    const coords: [number, number] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    const time = new Date().getTime();

    const direction = [coords[0] - this.swipeCoords[0], coords[1] - this.swipeCoords[1]];
    const duration = time - this.swipeTime;

    if (
      duration < 1000 &&
      Math.abs(direction[0]) > 30 && // Long enough
      Math.abs(direction[0]) > Math.abs(direction[1] * 3) // Horizontal enough
    ) {
      const swipeDir = direction[0] < 0 ? 'left' : 'right';

      // Do whatever you want with swipe...
      this.swipeEvent.emit(swipeDir);
    }
  }
}
