import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TitleAndBreadcrumbsService {

  // breadcrumbs levels
  levels: number;
  // escape some routes from the url
  escape: string[];
  // cache options version every time to compare it with the new version
  oldCachedVersion: number = 0;
  newCachedVersion: number = 0;

  constructor() { }

  // set breadcrumbs options in every page
  setBreadcrumbsOptions(levels: number, escape?: string[]) {
    this.levels = levels;
    this.escape = escape ? escape : undefined;
    this.newCachedVersion += 1;
  }
}
