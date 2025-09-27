
# Project Blueprint: "Mis Finanzas"

## 1. Overview

"Mis Finanzas" is a personal finance management application designed to provide a clear and intuitive way to track income, expenses, and monthly balances. The application features a clean, modern interface with a focus on data visualization and ease of use. It is built with the latest version of Angular, leveraging standalone components, signals for state management, and modern CSS for a responsive and visually appealing user experience.

## 2. Core Features & Design

This section outlines the key features and design elements that have been implemented in the application.

### **Authentication & Layout**
- **Firebase Authentication:** Secure login and logout functionality using Firebase.
- **Dynamic Layout:** The main layout adapts based on the user's authentication status.
- **Floating Action Buttons:** A set of floating buttons provides quick access to the main features of the application.

### **Data Management**
- **Movimientos (Movements):** A real-time grid displays a list of financial movements, which can be added, edited, and deleted.
- **Ingresos (Income):** A dialog for managing monthly income.
- **MSI (Meses Sin Intereses):** A dialog for tracking fixed monthly installments.
- **Balance General (General Balance):** A comprehensive dialog that provides a monthly financial summary, including:
    - Total income.
    - A breakdown of variable and fixed expenses.
    - The final balance.
    - A weekly breakdown of spending against user-defined limits.

### **Visual Design & UI**
- **Modern & Clean UI:** The application uses a modern design system with a clean and organized layout.
- **Responsive Design:** The interface is fully responsive and adapts to different screen sizes.
- **Consistent Styling:** A consistent color palette, typography, and iconography are used throughout the application to create a cohesive user experience.
- **Data Visualization:** Key financial data is presented in visually appealing cards and grids to facilitate quick comprehension.
- **Floating Navigation:** The primary navigation is implemented as a set of floating buttons, which are currently positioned at the top of the screen for easy access.

## 3. Recent Modifications

This section documents the most recent changes made to the application.

### **UI & Layout Enhancements**
- **Floating Buttons Repositioned:** The floating action buttons were moved from the bottom to the top of the screen to improve accessibility and provide an unobstructed view of the main content area.
- **Compact Balance Cards:** The "Ingreso Total del Mes" and "Saldo Final" cards in the "Balance General" dialog have been redesigned to be more compact. They are now displayed side-by-side to reduce vertical space and improve the overall layout.

### **Functional Improvements**
- **Weekly Breakdown with Day Count:** The weekly breakdown in the "Balance General" dialog now displays the number of days in each week. This provides more context to the spending periods.

### **Cancelled Features**
- **"Fecha de Corte" Feature:** The development of a feature to set a custom credit card cutoff date was initiated but subsequently cancelled at the user's request. No related code was integrated into the application.
