import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';

// home pages components
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { TermsConditionsComponent } from './pages/terms-conditions/terms-conditions.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

// shop pages components
import { ShopCategoriesComponent } from './pages/categories/shop-categories.component';
import { ShopComponent } from './pages/shop/shop.component';
import { SingleGoodComponent } from './pages/single-good/single-good.component';
import { ShoppingCartComponent } from './pages/shopping-cart/shopping-cart.component';
import { CartViewComponent } from './pages/shopping-cart/cart-view/cart-view.component';
import { CheckoutComponent } from './pages/shopping-cart/checkout/checkout.component';
import { ConfirmationComponent } from './pages/shopping-cart/confirmation/confirmation.component';
import { WishlistGoodsComponent } from './pages/wishlist-goods/wishlist-goods.component';


@NgModule({
  declarations: [
    // home pages components
    HomeComponent,
    AboutComponent,
    ContactComponent,
    TermsConditionsComponent,
    SignUpComponent,
    SignInComponent,
    NotFoundComponent,

    // shop pages components
    ShopCategoriesComponent,
    ShopComponent,
    SingleGoodComponent,
    ShoppingCartComponent,
    CartViewComponent,
    CheckoutComponent,
    ConfirmationComponent,
    WishlistGoodsComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ]
})
export class HomeModule { }
