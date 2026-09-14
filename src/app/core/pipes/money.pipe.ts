import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(amount: number | null | undefined, currencyCode: string | null | undefined): string {
    const value = (amount ?? 0).toFixed(2);
    return currencyCode ? `${value} ${currencyCode}` : value;
  }
}
