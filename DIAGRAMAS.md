
# Diagramas de Arquitectura y Flujo

Este documento contiene los diagramas que representan la arquitectura, la estructura de datos y los flujos de interacción de la aplicación "Mis Finanzas".

---

## 1. Diagrama de Componentes

Este diagrama muestra la relación entre los principales componentes y servicios de la aplicación. Ilustra cómo los componentes de la interfaz de usuario (UI) dependen de los servicios para obtener y manipular los datos.

```mermaid
graph TD
    subgraph "Servicios (Lógica de Negocio)"
        AuthService
        MovimientoService
        IngresosService
        MsiService
        BalanceMensualService
    end

    subgraph "Componentes (UI)"
        AppComponent --ruta--> LoginComponent
        AppComponent --ruta--> MovimientosComponent
        AppComponent --ruta--> IngresosComponent
        AppComponent --ruta--> MsiComponent
        AppComponent --ruta--> BalanceComponent
        AppComponent --dialog--> BalanceMensualComponent
    end

    subgraph "Firebase (Backend)"
        FirebaseDB[(Firebase RTDB)]
    end

    %% Conexiones entre Componentes y Servicios
    LoginComponent --> AuthService
    MovimientosComponent --> MovimientoService
    IngresosComponent --> IngresosService
    MsiComponent --> MsiService
    BalanceComponent --> MovimientoService
    BalanceComponent --> IngresosService
    BalanceComponent --> MsiService
    BalanceMensualComponent --> BalanceMensualService
    
    BalanceMensualService --> IngresosService
    BalanceMensualService --> MovimientoService
    BalanceMensualService --> MsiService

    %% Conexiones de Servicios a Firebase
    AuthService --> FirebaseDB
    MovimientoService --> FirebaseDB
    IngresosService --> FirebaseDB
    MsiService --> FirebaseDB
```

---

## 2. Diagrama de Datos (Entidad-Relación)

Este diagrama describe la estructura de los datos almacenados en Firebase Realtime Database. La base de datos sigue un modelo NoSQL, donde los datos de cada usuario se almacenan bajo su `uid` único.

```mermaid
erDiagram
    USUARIO {
        string uid PK "Identificador único de Firebase Auth"
    }

    MOVIMIENTOS {
        string id PK "ID autogenerado por Firebase"
        float monto "Cantidad del gasto"
        string descripcion "Descripción del gasto"
        string fecha "Fecha del gasto (YYYY-MM-DD)"
    }

    INGRESOS {
        string id PK "ID autogenerado por Firebase"
        float monto "Cantidad del ingreso"
        string descripcion "Descripción del ingreso"
        string fecha "Fecha del ingreso (YYYY-MM-DD)"
    }

    MSI {
        string id PK "ID autogenerado por Firebase"
        float montototal "Monto total de la compra original"
        float monto "Monto del pago mensual"
        string descripcion "Descripción de la compra"
        int num_mes "Número de la mensualidad actual"
        int meses "Total de mensualidades"
        string fecha "Fecha del pago mensual (YYYY-MM-DD)"
    }

    USUARIO ||--o{ MOVIMIENTOS : "tiene"
    USUARIO ||--o{ INGRESOS : "tiene"
    USUARIO ||--o{ MSI : "tiene"
```

---

## 3. Diagrama de Secuencia: Agregar un Nuevo Gasto

Este diagrama detalla los pasos y las interacciones entre el usuario, los componentes y los servicios cuando se agrega un nuevo movimiento (gasto).

```mermaid
sequenceDiagram
    participant Usuario
    participant MovimientosComponent
    participant MovimientoService
    participant AuthService
    participant FirebaseDB

    Usuario->>MovimientosComponent: 1. Rellena el formulario (monto, descripción, fecha) y hace clic en "Guardar"
    
    activate MovimientosComponent
    MovimientosComponent->>MovimientosComponent: 2. Valida los datos del formulario
    alt Formulario Válido
        MovimientosComponent->>MovimientoService: 3. Llama a addMovimiento(datos)
        
        activate MovimientoService
        MovimientoService->>AuthService: 4. Obtiene el UID del usuario actual
        
        activate AuthService
        AuthService-->>MovimientoService: 5. Retorna el UID
        deactivate AuthService
        
        MovimientoService->>FirebaseDB: 6. Guarda el nuevo movimiento en la ruta `movimientos/{uid}`
        
        activate FirebaseDB
        FirebaseDB-->>MovimientoService: 7. Confirma el guardado
        deactivate FirebaseDB
        
        MovimientoService-->>MovimientosComponent: 8. Retorna la confirmación
        deactivate MovimientoService
        
        MovimientosComponent->>MovimientosComponent: 9. Limpia el formulario
        Note right of MovimientosComponent: El componente se actualiza automáticamente gracias a la reactividad de los Signals.
    else Formulario Inválido
        MovimientosComponent->>Usuario: Muestra mensajes de error
    end
    deactivate MovimientosComponent
```
