import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../shared/shared.module';

// user dashboard components
import { UserDashboardComponent } from './user-dashboard.component';
import { UserNavigatorComponent } from './navigator/user-navigator.component';
import { UserViewportComponent } from './viewport/user-viewport.component';
import { UserDashboardSidebarComponent } from './viewport/dashboard-sidebar/user-dashboard-sidebar.component';
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


@NgModule({
  declarations: [
    // user dashboard components
    UserDashboardComponent,
    UserNavigatorComponent,
    UserViewportComponent,
    UserDashboardSidebarComponent,
    UserProfileComponent,
    UserOrdersComponent,
    OrdersViewComponent,
    SingleOrderComponent,
    UserAddressesComponent,
    AddressesViewComponent,
    AddressesAddComponent,
    AddressesEditComponent,
    UserPaymentsComponent,
    PaymentsViewComponent,
    PaymentsAddComponent,
    PaymentsEditComponent,
    UserReturnComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule
  ]
})
export class UserModule { }
