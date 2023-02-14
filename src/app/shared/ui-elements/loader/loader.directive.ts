import {
  Directive,
  OnInit,
  ElementRef,
  ViewContainerRef,
  ComponentFactoryResolver,
  ComponentFactory,
  Renderer2,
  HostListener
} from '@angular/core';
import { LoaderComponent } from 'src/app/shared/ui-elements/loader/loader.component';

@Directive({
  selector: '[appLoader]'
})
export class LoaderDirective implements OnInit {

  // the loading element (host element)
  loadingElement: ElementRef<HTMLImageElement>;
  // the parent of the loading element
  loadingParent: ElementRef<HTMLElement>;
  // get the loader component
  LoaderComp: ComponentFactory<LoaderComponent>;
  // get the loader component ref
  LoaderCompRef;

  constructor(
    private element: ElementRef,
    private vcRef: ViewContainerRef,
    private cfResolver: ComponentFactoryResolver,
    private render: Renderer2
  ) { }

  ngOnInit() {
    // initialize variables data
    this.loadingElement = this.element.nativeElement;
    this.loadingParent = this.render.parentNode(this.loadingElement);
    this.LoaderComp = this.cfResolver.resolveComponentFactory(LoaderComponent);
    this.LoaderCompRef = this.vcRef.createComponent(this.LoaderComp).location.nativeElement;

    // add relative position to the parent
    this.render.setStyle(this.loadingParent, 'position', 'relative');

    // add the loader while loading
    this.render.appendChild(this.loadingParent, this.LoaderCompRef);
  }

  // remove the loader after loading
  @HostListener('load', ['$event']) onLoad() {
    this.render.removeChild(this.loadingParent, this.LoaderCompRef);
  }
}
