import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// user dashboard components
import { UserDashboardComponent } from './user-dashboard.component';
import { UserNavigatorComponent } from './navigator/user-navigator.component';
import { UserViewportComponent } from './viewport/user-viewport.component';
import { UserProfileComponent } from './viewport/profile/user-profile.component';
import { UserOrdersComponent } from './viewport/orders/user-orders.component';
import { OrdersViewComponent } from './viewport/orders/orders-view/orders-view.component';
import { SingleOrderComponent } from './viewport/orders/single-order/single-order.component';
import { UserAddressesComponent } from './viewport/addresses/user-addresses.component';
import { AddressesViewComponent } from './viewport/addresses/addresses-view/addresses-view.component';
import { AddressesAddComponent } from './viewport/addresses/addresses-add/addresses-add.component';
import { AddressesEditComponent } from './viewport/addresses/addresses-edit/addresses-edit.component';
import { UserPaymentsComponent } from './viewport/payments/user-payments.component';
import { PaymentsViewComponent } from './viewport/payments/payments-view/payments-view.component';
import { PaymentsAddComponent } from './viewport/payments/payments-add/payments-add.component';
import { PaymentsEditComponent } from './viewport/payments/payments-edit/payments-edit.component';
import { UserReturnComponent } from './viewport/return/user-return.component';

// routes guards
import { UserGuardService } from '../shared/services/routes-guards/user-guard.service';


const routes: Routes = [
  // user dashboard routes
  {path: '', component: UserDashboardComponent, children: [
    {path: '', redirectTo: 'index', pathMatch: 'full'},
    {path: 'index', component: UserNavigatorComponent},
    {path: 'user', component: UserViewportComponent, children: [
      // profile page route
      {path: 'profile', component: UserProfileComponent, data: {animation: 'ProfilePage'}},

      // my orders routes
      {path: 'my-orders', component: UserOrdersComponent, data: {animation: 'OrdersPage'}, children: [
        {path: '', redirectTo: 'page/1', pathMatch: 'full'},
        {path: 'page/:number', component: OrdersViewComponent},
        {path: 'order/:id', component: SingleOrderComponent}
      ]},

      // addresses routes
      {path: 'addresses', component: UserAddressesComponent, data: {animation: 'AddressesPage'}, children: [
        {path: '', redirectTo: 'page/1', pathMatch: 'full'},
        {path: 'page/:number', component: AddressesViewComponent},
        {path: 'add', component: AddressesAddComponent},
        {path: 'edit/:id', component: AddressesEditComponent}
      ]},

      // payments page route
      {path: 'payments', component: UserPaymentsComponent, data: {animation: 'PaymentsPage'}, children: [
        {path: '', redirectTo: 'page/1', pathMatch: 'full'},
        {path: 'page/:number', component: PaymentsViewComponent},
        {path: 'add', component: PaymentsAddComponent},
        {path: 'edit/:id', component: PaymentsEditComponent}
      ]},

      // return page route
      {path: 'return', component: UserReturnComponent, data: {animation: 'ReturnPage'}, children: [
        {path: '', redirectTo: 'page/1', pathMatch: 'full'},
        {path: 'page/:number', component: UserReturnComponent}
      ]},
    ]},
  ], canActivate: [UserGuardService]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
