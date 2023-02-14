import { Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-product-light-box',
  templateUrl: './product-light-box.component.html',
  styleUrls: ['./product-light-box.component.scss']
})
export class ProductLightBoxComponent implements OnInit {

  // light-box element
  @ViewChild('productLightBox') productLightBox: ElementRef<HTMLElement>;

  // html element
  htmlElement: HTMLHtmlElement;

  imagesUrls: string[];
  currentImg: HTMLImageElement;
  currentImgIndex: number;

  constructor(private render: Renderer2) { }

  ngOnInit(): void {
    // initialize variables data
    this.htmlElement = this.render.selectRootElement('html', true);

    // disable page scrolling while light-box is open (opened by initialize the component)
    this.render.setStyle(this.htmlElement, 'overflow-y', 'hidden');
  }

  // open light-box
  openLightBox() {
    // disable page scrolling while light-box is open
    this.render.setStyle(this.htmlElement, 'overflow-y', 'hidden');

    // show the LightBox
    this.render.setStyle(this.productLightBox.nativeElement, 'display', 'unset');
  }

  // close light-box
  closeLightBox() {
    // enable page scrolling while light-box is open
    this.render.setStyle(this.htmlElement, 'overflow-y', 'unset');

    // hide the LightBox
    this.render.setStyle(this.productLightBox.nativeElement, 'display', 'none');
  }

  // go to next image
  nextImg() {
    if (this.currentImgIndex < this.imagesUrls.length - 1) {
      this.currentImgIndex++;
    } else {
      this.currentImgIndex = 0;
    }

    // get the next img
    this.currentImg.src = this.imagesUrls[this.currentImgIndex];
  }

  // go to prev image
  prevImg() {
    if (this.currentImgIndex > 0) {
      this.currentImgIndex--;
    } else {
      this.currentImgIndex = this.imagesUrls.length - 1;
    }

    // get the next img
    this.currentImg.src = this.imagesUrls[this.currentImgIndex];
  }
}
