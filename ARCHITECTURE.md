# 🏗️ TaskManager App — Documentación de Arquitectura

> Guía técnica detallada sobre cómo se construyó esta aplicación, las decisiones de diseño tomadas, el flujo de datos y la estructura de cada capa.

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Stack tecnológico y justificación](#2-stack-tecnológico-y-justificación)
3. [Estructura de carpetas explicada](#3-estructura-de-carpetas-explicada)
4. [Capas de la arquitectura](#4-capas-de-la-arquitectura)
   - [4.1 Tipos (types/)](#41-tipos-types)
   - [4.2 Tema (theme/)](#42-tema-theme)
   - [4.3 Utilidades (utils/)](#43-utilidades-utils)
   - [4.4 Servicios (services/)](#44-servicios-services)
   - [4.5 Contextos (context/)](#45-contextos-context)
   - [4.6 Hooks personalizados (hooks/)](#46-hooks-personalizados-hooks)
   - [4.7 Componentes (components/)](#47-componentes-components)
   - [4.8 Pantallas (screens/)](#48-pantallas-screens)
   - [4.9 Navegación (navigation/)](#49-navegación-navigation)
5. [Flujo de datos](#5-flujo-de-datos)
6. [Sistema de animaciones](#6-sistema-de-animaciones)
7. [Persistencia de datos](#7-persistencia-de-datos)
8. [Sistema de autenticación](#8-sistema-de-autenticación)
9. [Sistema de tema (Dark/Light mode)](#9-sistema-de-tema-darklight-mode)
10. [Decisiones de diseño UI](#10-decisiones-de-diseño-ui)
11. [Consideraciones de rendimiento](#11-consideraciones-de-rendimiento)
12. [Configuración crítica](#12-configuración-crítica)
13. [Diagrama de flujo completo](#13-diagrama-de-flujo-completo)

---

## 1. Visión general

TaskManager sigue una arquitectura **feature-first con separación estricta de responsabilidades**. Cada capa tiene una responsabilidad única y bien definida:

```
Pantallas (UI)
    ↓ consumen
Hooks personalizados (lógica de UI)
    ↓ consumen
Contextos (estado global)
    ↓ consumen
Servicios (acceso a datos)
    ↓ consumen
AsyncStorage (persistencia)
```

Este patrón garantiza que:
- Los **componentes y pantallas** solo renderizan UI — no contienen lógica de negocio.
- Los **hooks** encapsulan la lógica de UI y son reutilizables entre pantallas.
- Los **contextos** gestionan el estado global de forma reactiva.
- Los **servicios** son la única fuente de verdad para leer/escribir datos.

---

## 2. Stack tecnológico y justificación

### Expo SDK 54 (Managed Workflow)
Se eligió Expo Managed porque:
- Elimina la necesidad de Xcode/Android Studio para desarrollo.
- Los módulos (`expo-haptics`, `expo-blur`, `expo-linear-gradient`) están pre-configurados.
- El proceso de build es manejado por EAS Build para producción.
- Compatible con Expo Go para desarrollo rápido.

### TypeScript 5.9 (strict mode)
- Interfaces fuertes para `Task`, `User`, `AuthSession`, `Theme`.
- Detección de errores en tiempo de compilación, no en runtime.
- `strict: true` activa todos los checks más estrictos (nullability, any implícito, etc.).

### React Navigation 7 (native-stack)
- `createNativeStackNavigator` usa las APIs nativas de navegación (UINavigationController en iOS, FragmentTransaction en Android) — transiciones más fluidas que las JS-only.
- Separación clara: `AuthStack` (Login/Register) y `AppStack` (Home/Create/Detail).

### react-native-reanimated 3
- Corre animaciones en el **UI Thread** (no en JS Thread), garantizando 60fps aunque el JS esté ocupado.
- Usado para: checkbox spring animation, FAB scale, progress ring, confeti particles.

### Moti
- Wrapper declarativo sobre Reanimated para animaciones sencillas.
- Sintaxis `from/animate/transition` similar a Framer Motion.
- Usado para: entrada de tarjetas (fade + slide), entradas de pantallas, cards.

### Context API (en lugar de Redux/Zustand)
- La app es pequeña-mediana: Context API es suficiente y no requiere dependencias extra.
- 3 contextos independientes evitan re-renders innecesarios: `AuthContext`, `TaskContext`, `ThemeContext`.
- `useMemo` en todos los valores del contexto para evitar re-renders de consumidores.

---

## 3. Estructura de carpetas explicada

```
src/
├── types/          ← Contratos TypeScript (interfaces, tipos)
├── theme/          ← Design tokens (colores, espaciado, tipografía, sombras)
├── utils/          ← Funciones puras sin side-effects ni imports de React
├── services/       ← Capa de acceso a datos (AsyncStorage)
├── context/        ← Estado global reactivo (Auth, Tasks, Theme)
├── hooks/          ← Wrappers de contextos + lógica reutilizable
├── components/     ← Componentes de UI reutilizables y sin lógica de negocio
├── screens/        ← Vistas completas consumidas por el navigator
└── navigation/     ← Stack navigators y configuración de rutas
```

### Principio de dependencias

Las capas **solo pueden importar hacia abajo**:

```
screens → hooks → context → services → utils/types
screens → components → hooks → ...
navigation → screens
App.tsx → navigation + context providers
```

Nunca un `service` importa de un `screen`, nunca un `context` importa de un `component`. Esto mantiene el grafo de dependencias acíclico y cada capa testeable de forma aislada.

---

## 4. Capas de la arquitectura

### 4.1 Tipos (types/)

**Archivos:** `task.types.ts`, `user.types.ts`

Son las **interfaces contrato** de toda la aplicación. Todas las demás capas los importan. No contienen lógica, solo definiciones de tipos.

**task.types.ts — tipos clave:**
```typescript
type Priority = 'low' | 'medium' | 'high'
type TaskFilter = 'all' | 'completed' | 'pending' | 'high'

interface Task {
  id: string
  userId: string          // ← tareas aisladas por usuario
  title: string
  description: string
  priority: Priority
  completed: boolean
  dueDate: string         // ISO-8601
  createdAt: string
  updatedAt: string
}

type CreateTaskPayload = Pick<Task, 'title' | 'description' | 'priority' | 'dueDate'>
type UpdateTaskPayload = Partial<Pick<Task, 'title' | 'description' | 'priority' | 'dueDate' | 'completed'>>
```

El uso de `Pick` y `Partial` para los payloads garantiza que solo se pasen los campos relevantes en cada operación, evitando sobre-escrituras accidentales de `id`, `userId` o `createdAt`.

**user.types.ts — tipos clave:**
```typescript
interface User {
  id: string
  name: string
  email: string
  password: string    // solo en storage local (demo)
  createdAt: string
}

type AuthUser = Omit<User, 'password'>    // ← nunca exponer password en el contexto

interface AuthSession {
  user: AuthUser
  token: string       // mock token para simular JWT
}
```

`AuthUser` es `User` sin `password` — la contraseña nunca circula por los contextos o pantallas, solo en el servicio de storage.

---

### 4.2 Tema (theme/)

**Archivos:** `colors.ts`, `theme.ts`

**colors.ts** contiene la paleta de colores cruda como objeto `const` — esto previene que se usen colores hardcoded en los componentes.

**theme.ts** define el tipo `Theme` (contrato completo del sistema de diseño) y exporta `lightTheme` y `darkTheme` como objetos que implementan ese contrato.

```typescript
interface Theme {
  dark: boolean
  colors: { primary, background, surface, card, text, textSecondary, ... }
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 }
  borderRadius: { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 }
  typography: { h1, h2, h3, body, caption, button }
  shadow: { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation }
}
```

Los **tokens base** (spacing, borderRadius, typography) son idénticos en ambos temas — solo los colores cambian. Esto garantiza que el layout sea coherente en ambos modos.

**¿Por qué no usar StyleSheet con colores fijos?**  
Porque haría imposible el tema dinámico. Al leer siempre de `theme.colors.X`, al cambiar el tema todos los componentes se re-renderizan con los valores correctos.

---

### 4.3 Utilidades (utils/)

**Archivo:** `helpers.ts`

Funciones puras sin side-effects. No importan React, no tienen estado, no hacen llamadas a APIs. Son trivialmente testeables con unit tests.

| Función | Propósito |
|---|---|
| `generateId()` | UUID v4 fake para IDs locales |
| `formatDate(iso)` | ISO string → "Feb 25, 2026" |
| `getGreeting()` | Hora del día → "Good morning/afternoon/evening" |
| `isValidEmail(email)` | Regex básico de validación de email |
| `clamp(v, min, max)` | Limitar número a rango |
| `priorityColor(priority)` | `'high'` → `'danger'`, `'medium'` → `'warning'`, etc. |
| `debounce(fn, ms)` | Debounce genérico con tipado TypeScript |

---

### 4.4 Servicios (services/)

**Archivo:** `storage.service.ts`

Es la **única capa que habla con AsyncStorage**. Centraliza serialización, manejo de errores y gestión de claves.

**Claves de AsyncStorage:**
```
@taskmanager/auth_session          → AuthSession
@taskmanager/users                 → User[]
@taskmanager/tasks_{userId}        → Task[]  (aislado por usuario)
@taskmanager/theme_mode            → 'light' | 'dark'
```

**El namespace `@taskmanager/` evita colisiones** si la app comparte espacio de almacenamiento con otras apps en el dispositivo.

**Manejo de errores:**
```typescript
async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.error(`[Storage] getItem(${key}) failed:`, error)
    return null  // ← nunca lanza, retorna null
  }
}
```

Todos los errores se capturan internamente y se retorna `null` / `[]`. Esto previene que un error de storage rompa la UI — la app degradará gracefully.

**API pública del servicio:**
```typescript
StorageService.getSession()
StorageService.saveSession(session)
StorageService.clearSession()
StorageService.getUsers()
StorageService.saveUsers(users)
StorageService.getTasks(userId)
StorageService.saveTasks(userId, tasks)
StorageService.getThemeMode()
StorageService.saveThemeMode(mode)
```

---

### 4.5 Contextos (context/)

Los tres contextos gestionan el estado global de la aplicación. Cada uno usa el patrón:
1. Definir interfaz del valor del contexto.
2. Crear contexto con valor default (para evitar `undefined`).
3. Crear `Provider` component que expone el estado y las acciones.
4. Usar `useMemo` en el valor para evitar re-renders innecesarios.

#### ThemeContext

- **Estado:** `isDark: boolean`
- **Al montar:** lee preferencia guardada en AsyncStorage.
- **`toggleTheme`:** invierte `isDark`, persiste la nueva preferencia.
- **Valor expuesto:** `{ theme: Theme, isDark, toggleTheme }`

#### AuthContext

- **Estado:** `user: AuthUser | null`, `isLoading: boolean`
- **Al montar:** intenta restaurar sesión desde AsyncStorage.
- **`register(payload)`:** valida → busca duplicados → crea usuario → guarda sesión.
- **`login(payload)`:** valida → busca usuario → verifica contraseña → guarda sesión.
- **`logout()`:** borra sesión de AsyncStorage → limpia estado.
- Retorna `string | null` en login/register — el string es el mensaje de error o `null` si fue exitoso.

#### TaskContext

- **Estado:** `tasks: Task[]`, `filter`, `searchQuery`, `isLoading`
- **Recibe `userId` como prop** — esto es crítico para aislar tareas por usuario.
- **`persist(tasks)`:** actualiza estado + guarda en AsyncStorage en una sola llamada.
- **`filteredTasks`:** derivado con `useMemo` aplicando filtro + búsqueda sobre `tasks`.
- **Estadísticas derivadas:** `totalTasks`, `completedTasks`, `completionRate`, `allCompleted` — calculadas en cada render, no guardadas en estado.

---

### 4.6 Hooks personalizados (hooks/)

Tres hooks simples que actúan como **fachadas de los contextos**:

```typescript
// useAuth.ts
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

**¿Por qué no importar el contexto directamente?**
- Si el componente se usa fuera del Provider, el error es claro e inmediato.
- Permite agregar lógica adicional en el hook sin modificar el contexto.
- Es el patrón estándar de la comunidad React.

---

### 4.7 Componentes (components/)

Todos los componentes son **presentation components** — reciben props, renderizan UI, emiten callbacks. No acceden directamente a contextos excepto `useTheme`.

#### AnimatedCheckbox
```
Props: checked, onToggle, size?

Internamente:
  progress (SharedValue 0→1)  ← controla color de fondo e interpolación
  scale (SharedValue)          ← controla bounce al presionar

Animaciones:
  backgroundColor: interpolateColor(progress, ['transparent', primary])
  borderColor: interpolateColor(progress, [border, primary])
  checkmark: opacity + scale con withSpring
  press: scale 1 → 0.85 → 1 con withSpring (damping bajo para bounce)
  haptic: NotificationFeedbackType.Success al completar
```

#### FloatingButton (FAB)
```
Press scale usando Reanimated:
  onPressIn  → scale.value = withSpring(0.88)
  onPressOut → scale.value = withSpring(1)

Fondo: LinearGradient (gradientStart → gradientEnd del tema)
Haptic: ImpactFeedbackStyle.Medium al soltar
```

#### SearchBar
```
BlurView con intensity adaptada al tema:
  Light mode: intensity 60, tint 'light'
  Dark mode:  intensity 40, tint 'dark'

Glassmorphism = BlurView + borderWidth + borderColor semitransparente
```

#### ProgressRing
```
Técnica de los dos semicírculos:
  Left half  → rota 0°→180° cuando progress va de 0 a 0.5
  Right half → rota 0°→180° cuando progress va de 0.5 a 1

withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) })

Centro: View circular con % label
```

#### TaskCard
```
MotiView (fade + slide):
  from: { opacity: 0, translateY: 24 }
  animate: { opacity: 1, translateY: 0 }
  delay: index * 80ms  ← animación escalonada entre cards

Swipeable (gesture-handler):
  renderRightActions: botón rojo "Delete"
  friction: 2  ← resistencia al swipe

Animated.View (reanimated):
  Layout.springify()  ← animación de layout al eliminar
  exiting: FadeOut    ← fade al eliminar

Priority strip: barra de 4px en borde izquierdo con color de prioridad
```

---

### 4.8 Pantallas (screens/)

#### LoginScreen / RegisterScreen
- **Patrón:** estado local (`useState`) para los campos del formulario.
- La lógica de validación vive en `AuthContext`, no en la pantalla.
- La pantalla solo llama `login(payload)` o `register(payload)` y muestra el error retornado.
- `KeyboardAvoidingView` + `ScrollView` para comportamiento correcto con teclado.
- Gradiente en header + card con sombra "flotando" sobre el gradiente (margin-top negativo).

#### HomeScreen
- La pantalla más compleja — orquesta `useTasks`, `useAuth`, `useTheme`.
- **Lista de tareas:** `FlatList` (no `ScrollView`) para virtualización — solo renderiza las tarjetas visibles.
- **Confeti:** `useEffect` con ref `prevAllCompleted` para detectar la transición `false → true` sin dispararse en cada render. 30 `ConfettiPiece` independientes con `Math.random()` para posición y duración.
- **Filtros:** computed via `useTasks().filteredTasks` — la pantalla no filtra directamente.

#### CreateTaskScreen
- Funciona en **dos modos** detectados por `route.params?.task`:
  - Sin parámetro → modo creación (`addTask`)
  - Con parámetro `task` → modo edición (`updateTask`)
- Estado local para los campos del formulario, pre-poblado con los valores existentes al editar.
- Selector de prioridad visualmente rico (chips con color semántico y borde activo).

#### TaskDetailScreen
- Lee el `task` actualizado desde `useTasks().tasks` (no solo del `route.params`) para reflejar toggles inmediatamente.
- Acciones Edit → navega a `CreateTaskScreen` con `task` como parámetro.
- Acción Delete → `Alert.alert` de confirmación → `deleteTask` → `navigation.goBack()`.

---

### 4.9 Navegación (navigation/)

**RootNavigator** es el orquestador principal:

```
isLoading=true  →  ActivityIndicator (hydrating session)
isLoading=false →
    isAuthenticated=false → AuthStack (Login / Register)
    isAuthenticated=true  → TaskProvider(userId) → AppStack (Home / CreateTask / Detail)
```

**¿Por qué `TaskProvider` vive en el navigator y no en `App.tsx`?**  
Porque `TaskProvider` necesita el `userId` del usuario autenticado. Si estuviera en `App.tsx`, no habría usuario aún. Al estar en el navigator, solo se monta cuando `isAuthenticated=true` y el `user` está disponible.

**NavTheme dinámico:**
```typescript
const navTheme = {
  ...(isDark ? DarkTheme : DefaultTheme),
  colors: {
    ...base.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    // ...
  }
}
```
Esto hace que los backgrounds de pantalla y la barra de navegación nativa usen los colores del tema correcto.

---

## 5. Flujo de datos

### Creación de una tarea

```
Usuario → CreateTaskScreen
  → handleSubmit()
    → useTasks().addTask({ title, description, priority, dueDate })
      → TaskContext.addTask()
        → generateId() + timestamp
        → persist([newTask, ...tasks])
          → setTasks(updated)           ← reactivo, UI actualiza
          → StorageService.saveTasks()  ← persiste en AsyncStorage
  → navigation.goBack()
```

### Login

```
Usuario → LoginScreen
  → handleLogin()
    → useAuth().login({ email, password })
      → AuthContext.login()
        → StorageService.getUsers()
        → find matching user
        → StorageService.saveSession({ user, token })
        → setUser(authUser)
          → isAuthenticated = true
            → RootNavigator detecta cambio
              → desmonta AuthStack
              → monta TaskProvider + AppStack
```

### Toggle de tema

```
Usuario → HomeScreen (botón 🌙/☀️)
  → useTheme().toggleTheme()
    → ThemeContext.toggleTheme()
      → setIsDark(!prev)
        → todos los consumidores de useTheme() re-renderizan
        → StorageService.saveThemeMode('dark'|'light')
```

---

## 6. Sistema de animaciones

### Jerarquía de herramientas

| Herramienta | Cuándo usarla | Ejemplos en la app |
|---|---|---|
| **Reanimated** | Animaciones de alto rendimiento en UI thread | Checkbox (spring), FAB (scale), ConfettiPiece (repeat), ProgressRing |
| **Moti** | Animaciones declarativas simples | Entradas de cards, entradas de pantallas, headers |
| **LayoutAnimation** | Cambios de layout automáticos | (Reanimated `Layout.springify()` se usa en su lugar para mejor control) |

### Principios de rendimiento

1. **`useSharedValue`** para valores que se animan — viven en el UI thread.
2. **`useAnimatedStyle`** para estilos derivados de shared values — nunca cruzar al JS thread durante la animación.
3. **`withSpring` vs `withTiming`:** spring para interacciones táctiles (rebote natural), timing para indicadores de progreso (predictible).
4. **Delays escalonados** en FlatList (`delay: index * 80ms`) — la primera tarjeta aparece inmediatamente, cada siguiente 80ms después, dando sensación de cascada.

---

## 7. Persistencia de datos

### Estrategia de namespacing

```
@taskmanager/tasks_user-id-1   → [Task, Task, ...]
@taskmanager/tasks_user-id-2   → [Task, Task, ...]   ← completamente aislado
```

Cada usuario tiene su propio slot de tareas. No hay mezcla de datos entre cuentas.

### Patrón read-modify-write

Para todas las mutaciones de tareas se usa el patrón:
```typescript
// 1. Leer estado actual en memoria (ya cargado)
const updated = tasks.map(t => t.id === id ? {...t, ...changes} : t)
// 2. Actualizar estado React
setTasks(updated)
// 3. Persistir
await AsyncStorage.setItem(key, JSON.stringify(updated))
```

No se lee de AsyncStorage en cada mutación — solo al montar. Esto hace las operaciones síncronas desde la perspectiva del UI.

---

## 8. Sistema de autenticación

### Flujo de registro

```
validateName → validateEmail → validatePassword → validateMatch
  → getUsers() → checkDuplicate
    → createUser(generateId, timestamps)
    → saveUsers([...existing, newUser])
    → saveSession({ user: AuthUser, token: generateId() })
    → setUser(authUser)
```

### Flujo de restauración de sesión

```
App mount →
  AuthProvider useEffect →
    getSession() →
      session exists → setUser(session.user)
      no session    → setIsLoading(false) → mostrar AuthStack
```

El `isLoading=true` inicial evita un flash de la pantalla de Login antes de que la sesión se restaure.

### Token mock

El `token` en `AuthSession` es simplemente otro `generateId()`. En una app real, este sería un JWT firmado por el servidor. Aquí sirve como placeholder estructural para que la migración a un backend real sea mínima — solo cambiar lo que `AuthContext` hace con el token.

---

## 9. Sistema de tema (Dark/Light mode)

### Cómo funciona

1. `ThemeContext` expone `theme: Theme` y `toggleTheme`.
2. **Todos** los estilos dinámicos se leen de `theme.colors.X`.
3. Al llamar `toggleTheme`, `isDark` cambia → `theme` cambia → React re-renderiza todos los consumidores de `useTheme()`.
4. `StyleSheet.create()` se usa solo para estilos estáticos (layouts, `position: 'absolute'`, etc.) — los colores siempre van en el objeto de estilo inline dinámico.

### Separación estático vs dinámico

```typescript
// ✅ CORRECTO
const styles = StyleSheet.create({
  card: {
    borderRadius: 16,      // ← estático (no cambia con tema)
    padding: 16,           // ← estático
    borderWidth: 1,        // ← estático
  }
})

// En el componente:
<View style={[
  styles.card,             // ← estático
  {
    backgroundColor: theme.colors.card,     // ← dinámico
    borderColor: theme.colors.border,       // ← dinámico
    ...theme.shadow,                        // ← dinámico (sombras)
  }
]} />
```

---

## 10. Decisiones de diseño UI

### ¿Por qué el estilo Apple/Linear/Notion?

- **Radios de 16px consistentes:** en todos los cards, inputs y botones.
- **Sombras sutiles:** `shadowOpacity: 0.08` en light mode — suficiente para profundidad, sin ser llamativas.
- **Gradientes de acento:** solo en elementos de acción principal (header, FAB, botón submit) — no en cards genéricos.
- **Glassmorphism restringido:** solo en el SearchBar, usando `BlurView`. Usarlo en más elementos degradaría el rendimiento.
- **Typography scale:** `h1: 32, h2: 24, h3: 18, body: 16, caption: 13` — escala modular para jerarquía clara.
- **Priority strips:** barra de 4px en el borde izquierdo del card — indica prioridad sin ocupar espacio.

### Decisión: Confeti al 100% completado

- Solo se dispara en la **transición** de no-completado → completado (no en cada render).
- Se usa `useRef(prevAllCompleted)` para trackear el estado anterior.
- 30 partículas con posición, color y duración aleatoria usando `withRepeat`.
- Se limpia automáticamente con `setTimeout` a los 3.5 segundos.

---

## 11. Consideraciones de rendimiento

### useCallback en handlers de lista

```typescript
const renderItem = useCallback(
  ({ item, index }: { item: Task; index: number }) => (
    <TaskCard ... />
  ),
  [toggleTask, deleteTask, handleTaskPress],
)
```

Sin `useCallback`, `FlatList` re-renderizaría todos los items en cada cambio de estado del padre.

### useMemo en valores de contexto

```typescript
const value = useMemo<TaskContextValue>(
  () => ({ tasks, filteredTasks, ... }),
  [tasks, filteredTasks, ...]
)
```

Sin `useMemo`, cualquier re-render del Provider crearía un nuevo objeto → todos los consumidores re-renderizarían innecesariamente.

### FlatList en lugar de ScrollView

`FlatList` virtualiza la lista — solo renderiza los items visibles en pantalla más un buffer. Con 100+ tareas, `ScrollView` renderizaría todo simultáneamente. `FlatList` mantiene el rendimiento constante independientemente del volumen de datos.

### Reanimated en UI Thread

Las animaciones de Reanimated corren completamente en el UI Thread nativo. Incluso si JavaScript está bloqueado (parsing, computación), las animaciones no se ven afectadas.

---

## 12. Configuración crítica

### babel.config.js — Reanimated plugin LAST

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // otros plugins aquí si los hay
      'react-native-reanimated/plugin', // ← OBLIGATORIO SER EL ÚLTIMO
    ],
  };
};
```

El plugin de Reanimated hace transformaciones en el AST (Abstract Syntax Tree) que deben aplicarse **después** de todos los otros plugins. Si va antes, el código workletizado puede no funcionar correctamente.

### index.ts — Gesture Handler PRIMERA importación

```typescript
import 'react-native-gesture-handler'; // ← PRIMERA, antes de TODO
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
```

`react-native-gesture-handler` necesita inicializarse antes que cualquier otro código de React Native. Esto se garantiza colocando el import en `index.ts` (entry point) como la primera línea.

### GestureHandlerRootView

```typescript
// App.tsx
<GestureHandlerRootView style={{ flex: 1 }}>
  <ThemeProvider>
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  </ThemeProvider>
</GestureHandlerRootView>
```

Todos los gestos (Swipeable en TaskCard) deben estar dentro de `GestureHandlerRootView`. De lo contrario, los gestos no funcionan.

---

## 13. Diagrama de flujo completo

```
index.ts
  └── import 'react-native-gesture-handler'
  └── registerRootComponent(App)
        │
        ▼
     App.tsx
      ├── GestureHandlerRootView
      │    ├── ThemeProvider        (dark/light, persiste preferencia)
      │    │    └── AuthProvider    (user, login, register, logout)
      │    │         └── RootNavigator
      │    │              │
      │    │              ├── [isLoading] ActivityIndicator
      │    │              │
      │    │              ├── [!isAuthenticated] AuthStack
      │    │              │         ├── LoginScreen
      │    │              │         └── RegisterScreen
      │    │              │
      │    │              └── [isAuthenticated] TaskProvider(userId)
      │    │                        └── AppStack
      │    │                              ├── HomeScreen
      │    │                              │     ├── ProgressRing
      │    │                              │     ├── SearchBar
      │    │                              │     ├── FilterChips
      │    │                              │     ├── FlatList → TaskCard (x N)
      │    │                              │     │               ├── AnimatedCheckbox
      │    │                              │     │               └── Swipeable
      │    │                              │     ├── FloatingButton
      │    │                              │     └── [allCompleted] Confetti
      │    │                              │
      │    │                              ├── CreateTaskScreen (create + edit)
      │    │                              │
      │    │                              └── TaskDetailScreen
      │    │                                    └── AnimatedCheckbox
      │    │
      │    └── StatusBar
      │
      └── (fuera del árbol React)
            ├── AsyncStorage (datos persistidos)
            └── Expo Native Modules (haptics, blur, linear-gradient)
```

---

## Resumen de patrones usados

| Patrón | Descripción | Dónde |
|---|---|---|
| Context + Provider | Estado global reactivo | `AuthContext`, `TaskContext`, `ThemeContext` |
| Custom Hook as facade | Acceso tipado al contexto | `useAuth`, `useTasks`, `useTheme` |
| Service layer | Abstracción de datos | `storage.service.ts` |
| Presentation component | UI sin lógica de negocio | Todos los components/ |
| Container pattern | Lógica en la pantalla via hooks | Screens |
| Derived state | Calculado en render, no guardado | `filteredTasks`, `completionRate` |
| Read-modify-write | Mutaciones inmutables | Todos los CRUD de tasks |
| Namespace keys | Evitar colisiones en storage | `@taskmanager/tasks_{userId}` |
| Conditional mounting | Provider scoped al usuario | `TaskProvider` en navigator |
