import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../shared/shared.module';

// admin dashboard components
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminNavigatorComponent } from './navigator/admin-navigator.component';
import { AdminViewportComponent } from './viewport/admin-viewport.component';
import { AdminDashboardSidebarComponent } from './viewport/admin-dashboard-sidebar/admin-dashboard-sidebar.component';
import { AdminRequestsComponent } from './viewport/requests/admin-requests.component';
import { AdminRequestsViewComponent } from './viewport/requests/requests-view/admin-requests-view.component';
import { AdminSingleRequestComponent } from './viewport/requests/single-request/admin-single-request.component';
import { AdminReturnComponent } from './viewport/return/admin-return.component';
import { AdminReturnsViewComponent } from './viewport/return/admin-returns-view/admin-returns-view.component';
import { AdminSingleReturnComponent } from './viewport/return/admin-single-return/admin-single-return.component';
import { AdminCategoriesComponent } from './viewport/categories/admin-categories.component';
import { AdminCategoriesViewComponent } from './viewport/categories/categories-view/admin-categories-view.component';
import { AdminCategoriesAddComponent } from './viewport/categories/categories-add/admin-categories-add.component';
import { AdminCategoriesEditComponent } from './viewport/categories/categories-edit/admin-categories-edit.component';
import { AdminProductsComponent } from './viewport/products/admin-products.component';
import { AdminProductsViewComponent } from './viewport/products/products-view/admin-products-view.component';
import { AdminProductsAddComponent } from './viewport/products/products-add/admin-products-add.component';
import { AdminProductsEditComponent } from './viewport/products/products-edit/admin-products-edit.component';
import { AdminMainSliderComponent } from './viewport/main-slider/admin-main-slider.component';
import { AdminMainOfferComponent } from './viewport/main-offer/admin-main-offer.component';
import { AdminUsersComponent } from './viewport/users/admin-users.component';
import { AdminUsersViewComponent } from './viewport/users/users-view/admin-users-view.component';
import { AdminSingleUserComponent } from './viewport/users/single-user/admin-single-user.component';
import { CouponsComponent } from './viewport/coupons/coupons.component';
import { CouponsViewComponent } from './viewport/coupons/coupons-view/coupons-view.component';
import { CouponsAddComponent } from './viewport/coupons/coupons-add/coupons-add.component';
import { CouponsEditComponent } from './viewport/coupons/coupons-edit/coupons-edit.component';
import { ContactFormComponent } from './viewport/contact-form/contact-form.component';
import { ContactFormNavigatorComponent } from './viewport/contact-form/navigator/contact-form-navigator.component';
import { ContactFormViewportComponent } from './viewport/contact-form/viewport/contact-form-viewport.component';
import { ContactFormMessagesComponent } from './viewport/contact-form/viewport/messages/contact-form-messages.component';
import { ContactFormMessagesViewComponent } from './viewport/contact-form/viewport/messages/messages-view/contact-form-messages-view.component';
import { ContactFormSingleMessageComponent } from './viewport/contact-form/viewport/messages/single-message/contact-form-single-message.component';
import { ContactFormBlacklistComponent } from './viewport/contact-form/viewport/blacklist/contact-form-blacklist.component';
import { ContactFormSettingsComponent } from './viewport/contact-form/viewport/settings/contact-form-settings.component';
import { NewsletterComponent } from './viewport/newsletter/newsletter.component';
import { GeneralSettingsComponent } from './viewport/general-settings/general-settings.component';


@NgModule({
  declarations: [
    // admin dashboard components
    AdminDashboardComponent,
    AdminNavigatorComponent,
    AdminViewportComponent,
    AdminDashboardSidebarComponent,
    AdminRequestsComponent,
    AdminRequestsViewComponent,
    AdminSingleRequestComponent,
    AdminReturnComponent,
    AdminReturnsViewComponent,
    AdminSingleReturnComponent,
    AdminCategoriesComponent,
    AdminCategoriesViewComponent,
    AdminCategoriesAddComponent,
    AdminCategoriesEditComponent,
    AdminProductsComponent,
    AdminProductsViewComponent,
    AdminProductsAddComponent,
    AdminProductsEditComponent,
    AdminMainSliderComponent,
    AdminMainOfferComponent,
    AdminUsersComponent,
    AdminUsersViewComponent,
    AdminSingleUserComponent,
    CouponsComponent,
    CouponsViewComponent,
    CouponsAddComponent,
    CouponsEditComponent,
    ContactFormComponent,
    ContactFormNavigatorComponent,
    ContactFormViewportComponent,
    ContactFormMessagesComponent,
    ContactFormMessagesViewComponent,
    ContactFormSingleMessageComponent,
    ContactFormBlacklistComponent,
    ContactFormSettingsComponent,
    NewsletterComponent,
    GeneralSettingsComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule
  ]
})
export class AdminModule { }
