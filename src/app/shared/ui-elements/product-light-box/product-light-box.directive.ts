import {
  Directive,
  OnInit,
  Input,
  ElementRef,
  ViewContainerRef,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Renderer2
} from '@angular/core';
import { ProductLightBoxComponent } from 'src/app/shared/ui-elements/product-light-box/product-light-box.component';

@Directive({
  selector: '[appProductLightBox]'
})
export class ProductLightBoxDirective implements OnInit {

  @Input('appProductLightBox') imagesUrls: string[];

  // the host element (image)
  hostImg: HTMLImageElement;
  // the parent of the host element
  hostParent: HTMLElement;

  // get the 'ProductLightBox' component
  productLightBoxComp: ComponentFactory<ProductLightBoxComponent>;
  // get the 'ProductLightBox' component ref
  productLightBoxCompRef: ComponentRef<ProductLightBoxComponent>;
  // light-box native-element
  productLightBoxCompNativeElement: HTMLDivElement;

  // flag to check if 'ProductLightBox' component is inserted
  isInserted: boolean;
  // the current shown img
  currentImg: HTMLImageElement;
  // the current shown img index
  currentImgIndex: number;

  constructor(
    private elRef: ElementRef<HTMLImageElement>,
    private vcRef: ViewContainerRef,
    private cfResolver: ComponentFactoryResolver,
    private render: Renderer2
  ) { }

  ngOnInit() {
    // initialize variables data
    this.hostImg = this.elRef.nativeElement;
    this.hostParent = this.render.parentNode(this.hostImg);

    // add some style
    this.render.setStyle(this.hostImg, 'cursor', 'zoom-in');

    // open the light-box when clicking on the hostImg
    this.render.listen(this.hostImg, 'click', () => this.openLightBox());
  }

  // open light-box
  openLightBox() {
    // check if 'ProductLightBox' component is inserted or not
    if (!this.isInserted) {
      this.productLightBoxComp = this.cfResolver.resolveComponentFactory(ProductLightBoxComponent);
      this.productLightBoxCompRef = this.vcRef.createComponent(this.productLightBoxComp);
      this.productLightBoxCompNativeElement = this.productLightBoxCompRef.location.nativeElement;

      // passing data to 'ProductLightBox' component
      this.productLightBoxCompRef.instance.imagesUrls = this.imagesUrls;
      this.currentImg = this.productLightBoxCompRef.instance.currentImg = this.hostImg;

      // insert the 'ProductLightBox' component in the parent element
      this.render.appendChild(this.hostParent, this.productLightBoxCompNativeElement);

      // component is inserted
      this.isInserted = true;
    } else {

      // call openLightBox method in 'ProductLightBox' component
      this.productLightBoxCompRef.instance.openLightBox();
    }

    // get the current index and pass it
    this.currentImgIndex = this.imagesUrls.findIndex(url => this.hostImg.src === url);
    this.productLightBoxCompRef.instance.currentImgIndex = this.currentImgIndex;
  }
}
