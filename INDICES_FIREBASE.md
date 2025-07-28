# Configuración de Índices en Firebase Firestore

## Problema Resuelto Temporalmente

He modificado las consultas para evitar el error de índices faltantes. Sin embargo, si quieres usar ordenamiento directo en Firebase (más eficiente), necesitas crear estos índices:

## Índices Necesarios

### 1. Para productos por negocio ordenados por nombre
```
Colección: products
Campos:
- businessId (Ascending)
- name (Ascending)
```

### 2. Para productos disponibles ordenados por nombre
```
Colección: products
Campos:
- available (Ascending)
- name (Ascending)
```

## Cómo Crear los Índices

### Opción 1: Desde la Consola de Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a **Firestore Database**
4. Haz clic en la pestaña **Índices**
5. Haz clic en **Crear índice**
6. Configura cada índice con los campos mencionados arriba

### Opción 2: Automáticamente (Recomendado)
1. Cuando uses las consultas con `orderBy()`, Firebase te dará un enlace directo
2. Haz clic en el enlace del error en la consola
3. Firebase creará automáticamente el índice necesario

## Después de Crear los Índices

Una vez creados los índices, puedes restaurar las consultas originales en `productService.js`:

```javascript
// En getBusinessProducts:
const q = query(
  collection(db, PRODUCTS_COLLECTION),
  where('businessId', '==', businessId),
  orderBy('name')
);

// En getAvailableProducts:
const q = query(
  collection(db, PRODUCTS_COLLECTION),
  where('available', '==', true),
  orderBy('name')
);
```

## Estado Actual

✅ **Productos se cargan correctamente** - Sin errores de índices
✅ **Ordenamiento funciona** - Se hace en el cliente
⚠️ **Menos eficiente** - Para muchos productos, es mejor usar índices de Firebase

## Nota

La solución actual funciona perfectamente para aplicaciones pequeñas y medianas. Solo necesitas crear los índices si tienes miles de productos por negocio.