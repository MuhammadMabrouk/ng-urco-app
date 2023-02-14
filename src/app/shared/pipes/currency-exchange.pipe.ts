import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'currencyExchange'
})
export class CurrencyExchangePipe extends CurrencyPipe implements PipeTransform {

  transform(price: number, args: any): string {
    if (args) {
      const newPrice = price * args.value;

      return super.transform(newPrice, args.currency, args.symbolString);
    }
  }
}
