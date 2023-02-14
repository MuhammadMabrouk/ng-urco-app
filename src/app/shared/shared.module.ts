import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// shared components
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MainSliderComponent } from './components/main-slider/main-slider.component';
import { GoodElementComponent } from './components/good-element/good-element.component';

// ui elements components
import { TitleAndBreadcrumbsComponent } from './ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.component';
import { MainLoadingComponent } from './ui-elements/main-loading/main-loading.component';
import { NotificationsComponent } from './ui-elements/notifications/notifications.component';
import { ProductLightBoxComponent } from './ui-elements/product-light-box/product-light-box.component';
import { LoaderComponent } from './ui-elements/loader/loader.component';
import { AccordionComponent } from './ui-elements/accordion/accordion.component';
import { InputNumberComponent } from './ui-elements/forms/input-number/input-number.component';
import { SelectMenuComponent } from './ui-elements/forms/select-menu/select-menu.component';
import { FileUploadComponent } from './ui-elements/forms/file-upload/file-upload.component';
import { PaginationComponent } from './ui-elements/pagination/pagination.component';
import { SimplePaginationComponent } from './ui-elements/simple-pagination/simple-pagination.component';
import { ModalComponent } from './ui-elements/modal/modal.component';
import { StarRatingComponent } from './ui-elements/star-rating/star-rating.component';
import { StarRatingViewComponent } from './ui-elements/star-rating-view/star-rating-view.component';
import { ReviewModelComponent } from './ui-elements/review-model/review-model.component';

// custom directives
import { MaskDirective } from './directives/mask.directive';
import { ProductLightBoxDirective } from './ui-elements/product-light-box/product-light-box.directive';
import { LoaderDirective } from './ui-elements/loader/loader.directive';
import { MenuToggleButtonDirective } from './directives/menu-toggle-button.directive';
import { CharRemainingDirective } from './directives/char-remaining.directive';
import { FixOrientationDirective } from './directives/fix-orientation.directive';
import { OnSwipeDirective } from './directives/on-swipe.directive';

// custom pipes
import { SelectMenuFilterPipe } from './ui-elements/forms/select-menu/select-menu-filter.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { CurrencyExchangePipe } from './pipes/currency-exchange.pipe';
import { ObjectValuesPipe } from './pipes/object-values.pipe';
import { ObjectKeysPipe } from './pipes/object-keys.pipe';

// for translation
import { TranslateModule } from '@ngx-translate/core';

// for datepicker
import { AngularMyDatePickerModule } from 'angular-mydatepicker';

// for range slider
import { Ng5SliderModule } from 'ng5-slider';

// for validation and formatting of credit card data
import { CreditCardDirectivesModule } from 'angular-cc-library';

// for infinite scroll
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

// for sticky sidebar
import { NgxStickySidebarModule } from '@smip/ngx-sticky-sidebar';

// shared components
const sharedComponents = [
  HeaderComponent,
  MainSliderComponent,
  FooterComponent,
  GoodElementComponent
];

// ui elements components
const uiElementsComponents = [
  TitleAndBreadcrumbsComponent,
  MainLoadingComponent,
  NotificationsComponent,
  ProductLightBoxComponent,
  LoaderComponent,
  AccordionComponent,
  InputNumberComponent,
  SelectMenuComponent,
  FileUploadComponent,
  PaginationComponent,
  SimplePaginationComponent,
  ModalComponent,
  StarRatingComponent,
  StarRatingViewComponent,
  ReviewModelComponent
];

// custom directives
const customDirectives = [
  MaskDirective,
  ProductLightBoxDirective,
  LoaderDirective,
  MenuToggleButtonDirective,
  CharRemainingDirective,
  FixOrientationDirective,
  OnSwipeDirective
];

// custom pipes
const customPipes = [
  SelectMenuFilterPipe,
  TruncatePipe,
  CurrencyExchangePipe,
  ObjectValuesPipe,
  ObjectKeysPipe
];

// shared modules
const sharedModules = [
  FormsModule,
  ReactiveFormsModule,

  // for translation
  TranslateModule,

  // for datepicker
  AngularMyDatePickerModule,

  // for range slider
  Ng5SliderModule,

  // for validation and formatting of credit card data
  CreditCardDirectivesModule,

  // for infinite scroll
  InfiniteScrollModule,

  // for sticky sidebar
  NgxStickySidebarModule
];

@NgModule({
  imports: [
    CommonModule,
    SharedRoutingModule,

    // shared modules
    ...sharedModules
  ],
  declarations: [
    ...sharedComponents,
    ...uiElementsComponents,
    ...customDirectives,
    ...customPipes
  ],
  entryComponents: [
    LoaderComponent
  ],
  exports: [
    ...sharedComponents,
    ...uiElementsComponents,
    ...customDirectives,
    ...customPipes,
    ...sharedModules
  ]
})
export class SharedModule { }
