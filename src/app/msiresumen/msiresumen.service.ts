import { inject, Injectable, computed } from '@angular/core';
import { MsiService, MsiRecord } from '../msi/msi.service';
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

export interface MsiResumenItem {
  fecha: Date;
  fechaFormateada: string;
  numCompras: number;
  totalCompras: number;
  isCurrentMonth: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MsiresumenService {
  private msiService = inject(MsiService);

  public resumenMSI = computed(() => {
    const msiRecords = this.msiService.msi();
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();

    const resumen: { [key: string]: { numCompras: number; totalCompras: number } } = {};

    for (const record of msiRecords) {
      const fechaRecord = new Date(record.fecha + 'T00:00:00Z');
      const mes = fechaRecord.getUTCMonth();
      const anio = fechaRecord.getUTCFullYear();
      const clave = `${anio}-${mes}`;

      if (!resumen[clave]) {
        resumen[clave] = { numCompras: 0, totalCompras: 0 };
      }
      resumen[clave].numCompras++;
      resumen[clave].totalCompras += record.monto;
    }

    const resultado: MsiResumenItem[] = [];
    const fechaInicio = subMonths(hoy, 6);

    for (let i = 0; i < 13; i++) {
        const fechaMes = addMonths(fechaInicio, i);
        const mes = fechaMes.getMonth();
        const anio = fechaMes.getFullYear();
        const clave = `${anio}-${mes}`;

        const esMesActual = mes === mesActual && anio === anioActual;

        if (resumen[clave]) {
            resultado.push({
                fecha: fechaMes,
                fechaFormateada: `${this.getNombreMes(mes)} ${anio}`,
                numCompras: resumen[clave].numCompras,
                totalCompras: resumen[clave].totalCompras,
                isCurrentMonth: esMesActual
            });
        } else {
            resultado.push({
                fecha: fechaMes,
                fechaFormateada: `${this.getNombreMes(mes)} ${anio}`,
                numCompras: 0,
                totalCompras: 0,
                isCurrentMonth: esMesActual
            });
        }
    }

    return resultado.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  });

  private getNombreMes(mes: number): string {
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return nombresMeses[mes];
  }
}
