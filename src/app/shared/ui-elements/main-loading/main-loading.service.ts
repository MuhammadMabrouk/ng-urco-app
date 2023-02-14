import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MainLoadingService {

  // tslint:disable-next-line: variable-name
  _loading: boolean;

  get loading(): boolean {
    return this._loading;
  }

  startLoading(): void {
    this._loading = true;
  }

  endLoading(): void {
    this._loading = false;
  }
}
