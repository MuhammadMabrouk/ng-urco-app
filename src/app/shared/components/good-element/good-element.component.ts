import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { CartService } from 'src/app/shared/services/goods/cart.service';
import { WishlistService } from 'src/app/shared/services/goods/wishlist.service';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { Cart } from 'src/app/shared/interfaces/goods/cart';
import { Wishlist } from 'src/app/shared/interfaces/goods/wishlist';

@Component({
  selector: 'app-good-element',
  templateUrl: './good-element.component.html',
  styleUrls: ['./good-element.component.scss']
})
export class GoodElementComponent {

  // goods array for loop
  @Input() good: Goods;

  // className to determine which layout to apply
  @Input() className: 'multi-columns' | 'single-column';

  constructor(
    public translateSer: TranslateService,
    public currencyExchangeSer: CurrencyExchangeService,
    private cartSer: CartService,
    private wishlistSer: WishlistService,
  ) { }

  // add selected goods to cart
  addToCart(good: Goods) {
    const data: Cart = {
      id: good.id,
      seqNo: Date.now(),
      size: (good.sizes) ? good.sizes[0] : 'N/A',
      qty: 1
    };
    this.cartSer.addToCart(data);
  }

  // add selected goods to wishlist
  addToWishlist(good: Goods) {
    const data: Wishlist = {
      id: good.id,
      seqNo: Date.now(),
      size: (good.sizes) ? good.sizes[0] : 'N/A',
      qty: 1
    };
    this.wishlistSer.addToWishlist(data);
  }
}
