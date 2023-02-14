import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// home pages components
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { TermsConditionsComponent } from './pages/terms-conditions/terms-conditions.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';

// shop pages components
import { ShopCategoriesComponent } from './pages/categories/shop-categories.component';
import { ShopComponent } from './pages/shop/shop.component';
import { SingleGoodComponent } from './pages/single-good/single-good.component';
import { ShoppingCartComponent } from './pages/shopping-cart/shopping-cart.component';
import { CartViewComponent } from './pages/shopping-cart/cart-view/cart-view.component';
import { CheckoutComponent } from './pages/shopping-cart/checkout/checkout.component';
import { ConfirmationComponent } from './pages/shopping-cart/confirmation/confirmation.component';
import { WishlistGoodsComponent } from './pages/wishlist-goods/wishlist-goods.component';

// routes guards
import { GuestGuardService } from '../shared/services/routes-guards/guest-guard.service';
import { UserGuardService } from '../shared/services/routes-guards/user-guard.service';


const routes: Routes = [

  // home pages routes
  {path: '', component: HomeComponent},
  {path: 'about-us', component: AboutComponent},
  {path: 'contact-us', component: ContactComponent},
  {path: 'terms&conditions', component: TermsConditionsComponent},
  {path: 'sign-up', component: SignUpComponent, canActivate: [GuestGuardService]},
  {path: 'sign-in', component: SignInComponent, canActivate: [GuestGuardService]},

  // shop pages routes
  {path: 'categories', component: ShopCategoriesComponent},
  {path: 'shop', component: ShopComponent},
  {path: 'good/:id', component: SingleGoodComponent},
  {path: 'shopping-cart', component: ShoppingCartComponent, children: [
    {path: '', redirectTo: 'index', pathMatch: 'full'},
    {path: 'index', component: CartViewComponent},
    {path: 'checkout/:total', component: CheckoutComponent, canActivate: [UserGuardService]},
    {path: 'confirmation', component: ConfirmationComponent, canActivate: [UserGuardService]}
  ]},
  {path: 'wishlist', component: WishlistGoodsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
