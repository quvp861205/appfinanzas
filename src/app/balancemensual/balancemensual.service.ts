import { Injectable, computed, inject } from '@angular/core';
import { IngresosService } from '../ingresos/ingresos.service';
import { MovimientoService } from '../movimientos/services/movimiento.service';
import { MsiService } from '../msi/msi.service';

@Injectable({
  providedIn: 'root'
})
export class BalanceMensualService {
  private ingresosService = inject(IngresosService);
  private movimientoService = inject(MovimientoService);
  private msiService = inject(MsiService);

  private ingresos = this.ingresosService.ingresos;
  private movimientos = this.movimientoService.movimientos;
  private msi = this.msiService.msi;

  public balanceMensual = computed(() => {
    const ingresosPorMes = this.groupFinancialDataByMonth(this.ingresos());
    const gastosPorMes = this.groupFinancialDataByMonth(this.movimientos());
    const msiPorMes = this.groupFinancialDataByMonth(this.msi());

    const allMonths = new Set([...ingresosPorMes.keys(), ...gastosPorMes.keys(), ...msiPorMes.keys()]);

    let saldoAcumulado = 0;
    const balance = Array.from(allMonths).sort().map(mes => {
      const ingreso = ingresosPorMes.get(mes) || 0;
      const gasto = (gastosPorMes.get(mes) || 0) + (msiPorMes.get(mes) || 0);
      const saldo = ingreso - gasto;
      saldoAcumulado += saldo;

      return {
        mes,
        ingreso,
        gasto,
        saldo,
        saldoAcumulado
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
