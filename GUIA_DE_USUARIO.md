
# Mis Finanzas App

¡Bienvenido a Mis Finanzas! Esta aplicación está diseñada para ayudarte a tomar el control de tus finanzas personales de una manera sencilla e intuitiva. Podrás registrar tus ingresos y gastos, y visualizar balances mensuales y proyecciones anuales para entender mejor tus hábitos financieros.

## Guía de Usuario

A continuación, se detallan las principales funcionalidades de la aplicación y cómo utilizarlas.

---

### Gestión de Movimientos (Gastos)

La pantalla principal te permite gestionar tus gastos diarios.

#### Agregar un Nuevo Gasto
1.  **Rellena el formulario "Nuevo Gasto"** que aparece en la parte superior.
    *   **Monto**: La cantidad que gastaste.
    *   **Descripción**: Una breve nota para recordar en qué gastaste (ej: "Café con amigos", "Compra de supermercado").
    *   **Fecha**: El día en que se realizó el gasto. Por defecto, será la fecha actual.
2.  Haz clic en el botón **Guardar**. El nuevo gasto aparecerá inmediatamente en la lista de "Últimos Movimientos".

#### Editar un Gasto
1.  En la lista de "Últimos Movimientos", haz clic sobre el gasto que deseas modificar.
2.  Los datos de ese gasto se cargarán automáticamente en el formulario, que ahora se llamará **"Editar Gasto"**.
3.  Realiza los cambios que necesites en el monto, la descripción o la fecha.
4.  Haz clic en el botón **Actualizar** para guardar los cambios.

#### Eliminar un Gasto
1.  Selecciona el gasto que deseas eliminar haciendo clic sobre él en la lista.
2.  Aparecerán dos nuevos botones a la izquierda del formulario. Haz clic en el **ícono de la papelera** (`<i class="bi bi-trash"></i>`).
3.  Confirma que deseas eliminar el movimiento. El gasto desaparecerá de la lista.

---

### Gestión de Ingresos

Para registrar el dinero que recibes, puedes usar la sección de ingresos.

#### Agregar un Nuevo Ingreso
1.  Haz clic en el botón de **Agregar Ingreso**.
2.  Se abrirá un formulario similar al de los gastos.
    *   **Monto**: La cantidad de dinero que recibiste.
    *   **Descripción**: El origen del ingreso (ej: "Salario quincenal", "Venta de garage").
    *   **Fecha**: El día en que recibiste el ingreso.
3.  Haz clic en **Guardar**.

#### Eliminar un Ingreso
1.  Dentro de la lista de ingresos, cada registro tendrá un **ícono de papelera** a su lado.
2.  Haz clic en él para eliminar el ingreso correspondiente.

---

### Gestión de Meses sin Intereses (MSI)

Esta sección te permite llevar un control detallado de las compras que has realizado a meses sin intereses, que son consideradas tus **gastos fijos**.

#### Agregar una Nueva Compra a MSI
1.  Abre la sección de **"Meses sin Intereses"**.
2.  Rellena el formulario con los datos de tu compra:
    *   **Monto Total**: El costo total del artículo que compraste.
    *   **Descripción**: Un nombre para identificar la compra (ej: "Nuevo celular", "Laptop de trabajo").
    *   **Fecha de Inicio**: El día en que realizaste la compra. El sistema usará esta fecha para calcular el primer pago.
    *   **Número de Meses**: El total de mensualidades en las que se dividió tu compra (ej: 3, 6, 12).
3.  Haz clic en **Guardar**. El sistema automáticamente calculará el monto de cada mensualidad y creará un registro de pago para cada mes correspondiente. Por ejemplo, si registras una compra de $1200 a 12 meses, se crearán 12 pagos de $100, uno para cada mes.

#### Visualizar y Filtrar Pagos
*   La vista principal te mostrará una lista de todas las **compras activas**.
*   Para ver el detalle de los pagos de una compra específica, selecciónala en el desplegable **"Filtrar por descripción"**.
*   Si quieres revisar compras que ya has terminado de pagar, marca la casilla **"Ver Antiguos"**.

#### Eliminar una Compra a MSI
1.  Selecciona la compra que deseas eliminar del listado principal.
2.  Aparecerá un **ícono de papelera** junto a la descripción.
3.  Haz clic en él y confirma la acción. **Importante**: Esto eliminará **todos** los pagos asociados a esa compra, tanto los pasados como los futuros.

---

### Balance del Mes

Esta vista te ofrece un resumen detallado de tu situación financiera para el mes en curso. Para acceder a ella, busca el botón o la sección de "Balance".

En esta pantalla encontrarás:
*   **Ingreso Total del Mes**: La suma de todos los ingresos que has registrado en el mes.
*   **Gasto Fijo del Mes**: La suma de tus gastos recurrentes (pagos a meses sin intereses).
*   **Gasto Variable del Mes**: La suma de todos los movimientos (gastos diarios) que has registrado.
*   **Gasto Total del Mes**: La suma del gasto fijo y el gasto variable.
*   **Saldo Final**: El resultado de restar el gasto total a tu ingreso total. Esto te muestra cuánto dinero te queda al final del mes.
*   **Semanas**: Un desglose de tu presupuesto semanal, mostrando cuánto has gastado y cuál es tu límite recomendado para no excederte.

---

### Balance Anual (Proyección)

Esta funcionalidad te brinda una visión a largo plazo de tus finanzas, mostrando una tabla con el balance de los últimos 6 meses, el mes actual y una proyección para los siguientes 6 meses.

La tabla contiene las siguientes columnas:
*   **Mes**: El mes correspondiente al registro.
*   **Ingreso**: El total de ingresos registrados en ese mes.
*   **Gasto**: El total de gastos (fijos y variables) de ese mes.
*   **Saldo**: La diferencia entre los ingresos y los gastos del mes (`Ingreso - Gasto`).
*   **Saldo Acumulado**: La suma de los saldos de los meses anteriores. Te permite ver cómo tu patrimonio crece (o disminuye) con el tiempo.

El mes actual aparecerá resaltado para que puedas identificarlo fácilmente.
