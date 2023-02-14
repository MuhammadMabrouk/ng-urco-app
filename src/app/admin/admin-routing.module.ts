import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// admin dashboard components
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminNavigatorComponent } from './navigator/admin-navigator.component';
import { AdminViewportComponent } from './viewport/admin-viewport.component';
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
import { AdminUsersComponent } from './viewport/users/admin-users.component';
import { AdminProductsComponent } from './viewport/products/admin-products.component';
import { AdminProductsViewComponent } from './viewport/products/products-view/admin-products-view.component';
import { AdminProductsAddComponent } from './viewport/products/products-add/admin-products-add.component';
import { AdminProductsEditComponent } from './viewport/products/products-edit/admin-products-edit.component';
import { AdminMainSliderComponent } from './viewport/main-slider/admin-main-slider.component';
import { AdminMainOfferComponent } from './viewport/main-offer/admin-main-offer.component';
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

// routes guards
import { AdminGuardService } from '../shared/services/routes-guards/admin-guard.service';


const routes: Routes = [
  // admin dashboard routes
  {path: '', component: AdminDashboardComponent, children: [
    {path: '', redirectTo: 'index', pathMatch: 'full'},
    {path: 'index', component: AdminNavigatorComponent},
    {path: 'admin', component: AdminViewportComponent, children: [
      // requests page route
      {path: 'requests', component: AdminRequestsComponent, data: {animation: 'RequestsPage'}, children: [
        {path: '', redirectTo: 'page/1', pathMatch: 'full'},
        {path: 'page/:number', component: AdminRequestsViewComponent},
        {path: 'request/:id', component: AdminSingleRequestComponent}
      ]},
      // returns page route
      {path: 'returns', component: AdminReturnComponent, data: {animation: 'ReturnsPage'}, children: [
        {path: '', redirectTo: 'page/1', pathMatch: 'full'},
        {path: 'page/:number', component: AdminReturnsViewComponent},
        {path: 'return/:id', component: AdminSingleReturnComponent}
      ]},
      // categories page route
      {path: 'categories', component: AdminCategoriesComponent, data: {animation: 'CategoriesPage'}, children: [
        {path: '', redirectTo: 'page/1', pathMatch: 'full'},
        {path: 'page/:number', component: AdminCategoriesViewComponent},
        {path: 'add', component: AdminCategoriesAddComponent},
        {path: 'edit/:id', component: AdminCategoriesEditComponent}
      ]},
      // products page route
      {path: 'products', component: AdminProductsComponent, data: {animation: 'ProductsPage'}, children: [
        {path: '', redirectTo: 'page/1', pathMatch: 'full'},
        {path: 'page/:number', component: AdminProductsViewComponent},
        {path: 'add', component: AdminProductsAddComponent},
        {path: 'edit/:id', component: AdminProductsEditComponent}
      ]},
      // main slider page route
      {path: 'main-slider', component: AdminMainSliderComponent, data: {animation: 'MainSliderPage'}},
      // main offer page route
      {path: 'main-offer', component: AdminMainOfferComponent, data: {animation: 'MainOfferPage'}},
      // users page route
      {path: 'users', component: AdminUsersComponent, data: {animation: 'UsersPage'}, children: [
        {path: '', redirectTo: 'page/1', pathMatch: 'full'},
        {path: 'page/:number', component: AdminUsersViewComponent},
        {path: 'user/:id', component: AdminSingleUserComponent}
      ]},
      // coupons page route
      {path: 'coupons', component: CouponsComponent, data: {animation: 'CouponsPage'}, children: [
        {path: '', redirectTo: 'page/1', pathMatch: 'full'},
        {path: 'page/:number', component: CouponsViewComponent},
        {path: 'add', component: CouponsAddComponent},
        {path: 'edit/:id', component: CouponsEditComponent}
      ]},
      // contact-form page route
      {path: 'contact-form', component: ContactFormComponent, data: {animation: 'ContactFormPage'}, children: [
        {path: '', redirectTo: 'index', pathMatch: 'full'},
        {path: 'index', component: ContactFormNavigatorComponent},
        {path: 'view', component: ContactFormViewportComponent, children: [
          {path: 'messages', component: ContactFormMessagesComponent, children: [
            {path: '', redirectTo: 'page/1', pathMatch: 'full'},
            {path: 'page/:number', component: ContactFormMessagesViewComponent},
            {path: 'message/:id', component: ContactFormSingleMessageComponent}
          ]},
          {path: 'blacklist', component: ContactFormBlacklistComponent},
          {path: 'settings', component: ContactFormSettingsComponent},
        ]},
      ]},
      // newsletter page route
      {path: 'newsletter', component: NewsletterComponent, data: {animation: 'NewsletterPage'}},
      // general settings page route
      {path: 'general-settings', component: GeneralSettingsComponent, data: {animation: 'GeneralSettingsPage'}},
    ]},
  ], canActivate: [AdminGuardService]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
