import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface ICache {
  [key: string]: BehaviorSubject<any>;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private cache: ICache;

  constructor() {
    this.cache = Object.create(null);
  }

  setItem(key: string, value: any): BehaviorSubject<any> {
    localStorage.setItem(key, JSON.stringify(value));

    if (this.cache[key]) {
      this.cache[key].next(value);
      return this.cache[key];
    }

    return (this.cache[key] = new BehaviorSubject(value));
  }

  getItem(key: string): BehaviorSubject<any> {
    if (this.cache[key]) {
      return this.cache[key];
    } else {
      return (this.cache[key] = new BehaviorSubject(
        JSON.parse(localStorage.getItem(key))
      ));
    }
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
    if (this.cache[key]) {
      this.cache[key].next(undefined);
    }
  }
}
