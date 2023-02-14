import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

@Injectable({
  providedIn: 'root'
})
export class CurrencyExchangeService {

  defaultCurrency = 'USD';
  currencies = [this.defaultCurrency, 'EUR', 'EGP', 'SAR'];
  symbols = {
    USD: '$',
    EUR: '€',
    EGP: 'ج.م',
    SAR: 'ر.س'
  };
  url = `https://min-api.cryptocompare.com/data/price?fsym=${this.defaultCurrency}&tsyms=${this.currencies.join(',')}`;

  // updated object to pass to the conversion pipe
  exchangeRates: {
    currency: string,
    symbol: string,
    symbolString: string,
    value: number
  };

  constructor(private http: HttpClient) { }

  // get currencies
  getCurrencies() {
    return this.http.get(this.url);
  }
}
