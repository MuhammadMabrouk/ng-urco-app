import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, length: number, start: number = 0): string {
    if (value) {
      return (value.length > length) ? value.substr(start, length) + '...' : value;
    }
  }

}
