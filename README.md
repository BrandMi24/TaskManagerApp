<div align="center">

#  TaskManager App

**A premium, production-ready task management mobile application**  
built with Expo SDK 54, React Native, and TypeScript.

![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

##  Descripción

TaskManager es una aplicación móvil de gestión de tareas con diseño premium inspirado en **Apple**, **Linear** y **Notion**. Permite a los usuarios registrarse, iniciar sesión, crear y gestionar tareas con prioridades, fechas límite y estados de completado. Toda la información se persiste localmente mediante AsyncStorage.

---

##  Características principales

###  Sistema de autenticación
- Registro de usuario con validación completa
- Login con persistencia de sesión
- Cierre de sesión
- Estados de carga animados
- Transiciones de pantalla suaves

###  Dashboard principal
- Saludo personalizado con nombre del usuario
- Estadísticas en tiempo real (tareas totales / completadas)
- Anillo de progreso animado (Reanimated)
- Chips de filtro: **Todas / Completadas / Pendientes / Alta Prioridad**
- Barra de búsqueda con efecto glassmorphism (expo-blur)
- Botón flotante (FAB) con animación de escala
- Animación de confeti al completar todas las tareas

###  Sistema de tareas
- Crear tarea con título, descripción, prioridad y fecha límite
- Editar tarea existente
- Eliminar tarea con swipe (react-native-gesture-handler)
- Checkbox animado con retroalimentación háptica (expo-haptics)
- Animaciones de entrada en tarjetas (Moti)
- Indicador visual de prioridad por color

###  UI / Diseño
- Modo oscuro y claro con toggle en tiempo real
- Gradientes de acento (expo-linear-gradient)
- Glassmorphism en barra de búsqueda (expo-blur)
- Sombras suaves y bordes redondeados (16px)
- Micro-interacciones fluidas en todos los elementos
- Sistema de tema centralizado y escalable

---

##  Tech Stack

| Categoría | Tecnología |
|---|---|
| Framework | Expo SDK 54 (Managed Workflow) |
| UI | React Native 0.81 |
| Lenguaje | TypeScript 5.9 |
| Navegación | React Navigation 7 (native-stack) |
| Animaciones | react-native-reanimated + Moti |
| Gestos | react-native-gesture-handler |
| Almacenamiento | @react-native-async-storage/async-storage |
| Hápticos | expo-haptics |
| Blur | expo-blur |
| Gradientes | expo-linear-gradient |
| Estado global | Context API + Custom Hooks |

---

##  Estructura del proyecto

```
TaskManagerApp/
 App.tsx                    # Raíz  GestureHandler + Providers
 index.ts                   # Entry point (gesture-handler import)
 babel.config.js            # Reanimated plugin (last)
 tsconfig.json
 src/
     types/
        task.types.ts      # Task, Priority, TaskFilter, payloads
        user.types.ts      # User, AuthUser, AuthSession, payloads
     theme/
        colors.ts          # Paleta de colores (design tokens)
        theme.ts           # lightTheme / darkTheme
     utils/
        helpers.ts         # Utilidades puras (generateId, formatDate, etc.)
     services/
        storage.service.ts # Abstracción AsyncStorage
     context/
        AuthContext.tsx     # Autenticación y sesión
        TaskContext.tsx     # CRUD de tareas + filtros
        ThemeContext.tsx    # Tema claro/oscuro
     hooks/
        useAuth.ts
        useTasks.ts
        useTheme.ts
     components/
        AnimatedCheckbox.tsx
        FloatingButton.tsx
        SearchBar.tsx
        ProgressRing.tsx
        TaskCard.tsx
     screens/
        LoginScreen.tsx
        RegisterScreen.tsx
        HomeScreen.tsx
        CreateTaskScreen.tsx
        TaskDetailScreen.tsx
     navigation/
         RootNavigator.tsx
```

---

##  Instalación y ejecución

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd TaskManagerApp
npm install
```

### 2. Instalar módulos nativos de Expo

```bash
npx expo install @react-navigation/native @react-navigation/native-stack \
  @react-navigation/bottom-tabs react-native-screens \
  react-native-safe-area-context react-native-reanimated \
  react-native-gesture-handler @react-native-async-storage/async-storage \
  expo-haptics expo-blur expo-linear-gradient moti
```

### 3. Iniciar el servidor de desarrollo

```bash
npx expo start
```

Luego escanea el QR con **Expo Go** (Android/iOS), o presiona:
- `a`  Emulador Android
- `i`  Simulador iOS

---

##  Configuración importante

### babel.config.js

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], //  SIEMPRE al final
  };
};
```

### index.ts (entry point)

```ts
import 'react-native-gesture-handler'; //  SIEMPRE el primer import
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
```

---

##  Documentación técnica

Para una explicación detallada de la arquitectura, decisiones de diseño y flujo de datos, consulta:

 [ARCHITECTURE.md](./ARCHITECTURE.md)

---

##  Licencia

MIT  2026 TaskManager App
