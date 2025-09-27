# Mis Finanzas - Guía Técnica para Desarrolladores

Este documento proporciona todas las instrucciones necesarias para configurar, instalar y ejecutar el proyecto "Mis Finanzas" en un entorno de desarrollo local.

---

## Descripción del Proyecto

"Mis Finanzas" es una aplicación web de finanzas personales desarrollada con **Angular (v20+)**. Permite a los usuarios registrar sus ingresos y gastos, visualizar balances mensuales y obtener una proyección financiera a lo largo del tiempo. La aplicación sigue las mejores y más recientes prácticas de Angular, incluyendo:

*   **Componentes Standalone**: Arquitectura 100% basada en componentes independientes.
*   **Signals**: Para una gestión de estado reactiva y eficiente.
*   **Control Flow Nativo**: Uso de la nueva sintaxis `@` para la lógica en las plantillas.
*   **ChangeDetectionStrategy.OnPush**: Para un rendimiento optimizado.

La base de datos y el backend están gestionados por **Firebase**, utilizando **Firestore** como base de datos NoSQL en tiempo real.

---

## 1. Prerrequisitos

Antes de empezar, asegúrate de tener instalado el siguiente software en tu máquina:

*   **Node.js**: Versión 18 o superior. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
*   **npm** (Node Package Manager): Se instala automáticamente con Node.js.
*   **Angular CLI**: La interfaz de línea de comandos de Angular. Para instalarla, abre una terminal y ejecuta:
    ```bash
    npm install -g @angular/cli
    ```

---

## 2. Configuración de Firebase

El proyecto necesita una cuenta de Firebase para funcionar. Si no tienes una, el primer paso es crearla.

### 2.1. Crear un Proyecto en Firebase

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2.  Haz clic en **"Agregar proyecto"**.
3.  Sigue los pasos para nombrar tu proyecto. Puedes desactivar Google Analytics si no lo necesitas para el desarrollo local.
4.  Una vez creado el proyecto, serás redirigido al panel principal.

### 2.2. Configurar la Base de Datos Firestore

1.  En el menú de la izquierda, ve a la sección **"Compilación" > "Firestore Database"**.
2.  Haz clic en **"Crear base de datos"**.
3.  Elige iniciar en **modo de prueba**. Esto permite leer y escribir en la base de datos sin necesidad de configurar reglas de seguridad complejas al principio.
4.  Selecciona una ubicación para tus datos (puedes dejar la que viene por defecto).
5.  Haz clic en **"Habilitar"**.

### 2.3. Obtener las Credenciales de Firebase

Para que tu aplicación Angular pueda conectarse a tu proyecto de Firebase, necesitas las credenciales de configuración.

1.  En el panel de Firebase, ve a la **"Configuración del proyecto"** (el ícono de engranaje junto a "Descripción general del proyecto").
2.  En la pestaña **"General"**, desplázate hacia abajo hasta la sección **"Tus apps"**.
3.  Haz clic en el ícono de **web** (`</>`) para registrar una nueva aplicación web.
4.  Dale un apodo a tu aplicación (ej: "Mis Finanzas Local") y haz clic en **"Registrar app"**.
5.  Firebase te mostrará un objeto de configuración `firebaseConfig`. **Copia este objeto completo**. Lo necesitarás en el siguiente paso.

---

## 3. Instalación Local

Ahora que tienes todo lo necesario, puedes clonar y configurar el proyecto en tu máquina.

### 3.1. Clonar el Repositorio

```bash
git clone https://github.com/quvp861205/appfinanzas.git
```

### 3.2. Instalar Dependencias

Una vez dentro de la carpeta del proyecto, instala todas las dependencias necesarias con npm:

```bash
npm install
```

### 3.3. Configurar las Variables de Entorno

1.  En la raíz del proyecto, busca el archivo `src/environments/environment.ts`.
2.  Este archivo contiene un objeto `environment` con una propiedad `firebase`. Reemplaza el valor de esta propiedad con el objeto `firebaseConfig` que copiaste en el paso 2.3.

    El archivo debería verse así:

    ```typescript
    export const environment = {
      production: false,
      firebase: {
        apiKey: "TU_API_KEY",
        authDomain: "TU_AUTH_DOMAIN",
        projectId: "TU_PROJECT_ID",
        storageBucket: "TU_STORAGE_BUCKET",
        messagingSenderId: "TU_MESSAGING_SENDER_ID",
        appId: "TU_APP_ID"
      }
    };
    ```

---

## 4. Ejecución del Proyecto

Una vez que hayas instalado las dependencias y configurado las variables de entorno, puedes iniciar la aplicación.

1.  En la terminal, dentro de la carpeta del proyecto, ejecuta el siguiente comando:

    ```bash
    ng serve -o
    ```

2.  Este comando compilará la aplicación y la abrirá automáticamente en tu navegador web en la dirección `http://localhost:4200/`.

¡Y eso es todo! Ahora tienes el proyecto "Mis Finanzas" corriendo en tu máquina local, conectado a tu propia instancia de Firebase.
