import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cbuFormat',
  standalone: true
})
export class CbuFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value || value.length !== 22) {
      return value || '';
    }
    // Formato: XXXX-XXXX-XXXX-XXXX-XXXXXX
    return value.replace(/(\d{4})(\d{4})(\d{4})(\d{4})(\d{6})/, '$1-$2-$3-$4-$5');
  }

}
