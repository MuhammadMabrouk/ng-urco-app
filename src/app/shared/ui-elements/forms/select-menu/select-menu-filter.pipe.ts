import { Pipe, PipeTransform } from '@angular/core';
import { SelectMenu } from 'src/app/shared/ui-elements/forms/select-menu/select-menu';

@Pipe({
  name: 'selectMenuFilter'
})
export class SelectMenuFilterPipe implements PipeTransform {

  // search in dropdown menu
  transform(options: SelectMenu[], value: string): SelectMenu[] {
    if (!options || !value) {
      return options;
    }

    // options which match and return true will be kept, false will be filtered out
    return options.filter(data => data.label.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }

}
