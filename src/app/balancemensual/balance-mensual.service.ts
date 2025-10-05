import { Injectable, computed, inject } from '@angular/core';
import { IngresosService } from '../ingresos/ingresos.service';
import { BalanceService, Movimiento } from '../balance/balance.service';
import { MsiService } from '../msi/msi.service';

@Injectable({
  providedIn: 'root'
})
export class BalanceMensualService {
  private ingresosService = inject(IngresosService);
  private movimientoService = inject(BalanceService);
  private msiService = inject(MsiService);

  private ingresos = this.ingresosService.ingresos;
  private movimientos = this.movimientoService.movimientos;
  private msi = this.msiService.msi;

  public balanceMensual = computed(() => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 7, 0);
    
    const intl = new Intl.DateTimeFormat('es-MX', { month: 'short', year: 'numeric' });
    const currentMonthFormatted = intl.format(today).replace('.', '');
    const currentMonthCapitalized = currentMonthFormatted.charAt(0).toUpperCase() + currentMonthFormatted.slice(1);

    const filterByDate = (item: { fecha: string; monto: number }) => {
      const itemDate = new Date(item.fecha);
      itemDate.setMinutes(itemDate.getMinutes() + itemDate.getTimezoneOffset());
      return itemDate >= startDate && itemDate <= endDate;
    };

    const ingresosPorMes = this.groupFinancialDataByMonth(this.ingresos().filter(filterByDate));
    const gastosPorMes = this.groupFinancialDataByMonth(this.movimientos().filter(filterByDate));
    const msiPorMes = this.groupFinancialDataByMonth(this.msi().filter(filterByDate));

    const allMonths = new Set([...ingresosPorMes.keys(), ...gastosPorMes.keys(), ...msiPorMes.keys()]);

    let saldoAcumulado = 0;
    const balance = Array.from(allMonths).sort().map(mes => {
      const [year, month] = mes.split('-').map(Number);
      const date = new Date(year, month - 1);
      
      const formattedDate = intl.format(date).replace('.', '');
      const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

      const ingreso = ingresosPorMes.get(mes) || 0;
      const gasto = (gastosPorMes.get(mes) || 0) + (msiPorMes.get(mes) || 0);
      const saldo = ingreso - gasto;
      saldoAcumulado += saldo;

      return {
        mes: capitalizedDate,
        ingreso,
        gasto,
        saldo,
        saldoAcumulado,
        isCurrentMonth: capitalizedDate === currentMonthCapitalized
      };
    });

    return balance;
  });

  private groupFinancialDataByMonth(items: { fecha: string, monto: number }[]) {
    return items.reduce((acc, item) => {
      const month = item.fecha.substring(0, 7); // YYYY-MM
      acc.set(month, (acc.get(month) || 0) + item.monto);
      return acc;
    }, new Map<string, number>());
  }
}
