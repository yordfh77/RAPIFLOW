# Diagnóstico de Problemas con Firebase

## Estado Actual
✅ Reglas de Firebase aplicadas  
❌ Aún no se pueden guardar productos

## Pasos de Diagnóstico

### 1. Verificar Autenticación

**En la consola del navegador (F12 > Console), busca estos mensajes:**

✅ **Si aparece:** `Usuario autenticado: [ID]`  
❌ **Si aparece:** `No hay usuario autenticado`

### 2. Verificar Estado de Firebase

**Abre la consola del navegador y ejecuta este comando:**

```javascript
// Copia y pega esto en la consola del navegador
console.log('=== DIAGNÓSTICO FIREBASE ===');
console.log('Usuario actual:', firebase.auth().currentUser);
if (firebase.auth().currentUser) {
  console.log('UID:', firebase.auth().currentUser.uid);
  console.log('Email:', firebase.auth().currentUser.email);
  firebase.auth().currentUser.getIdToken().then(token => {
    console.log('Token válido:', token ? 'SÍ' : 'NO');
  });
} else {
  console.log('❌ NO HAY USUARIO AUTENTICADO');
}
```

### 3. Soluciones Según el Problema

#### Si NO hay usuario autenticado:
1. **Cierra sesión completamente**
2. **Vuelve a iniciar sesión** con credenciales de negocio
3. **Verifica que el tipo de usuario sea 'negocio'**

#### Si SÍ hay usuario autenticado pero sigue fallando:

**Opción A: Usar reglas más permisivas temporalmente**

Ve a Firebase Console > Firestore Database > Rules y usa estas reglas TEMPORALES:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Opción B: Verificar configuración de Firebase**

1. Ve a Firebase Console
2. Verifica que estés en el proyecto correcto: **rapiflow-b31de**
3. Ve a Project Settings > General
4. Copia la configuración y compárala con `src/config/firebase.js`

### 4. Prueba Manual

**Después de aplicar las soluciones:**

1. **Recarga la página completamente** (Ctrl+F5)
2. **Inicia sesión nuevamente**
3. **Ve a "Mis Productos"**
4. **Intenta agregar un producto simple:**
   - Nombre: "Producto Test"
   - Precio: "10"
   - Tiempo: "15"
5. **Revisa la consola** para ver los mensajes

### 5. Mensajes Esperados en la Consola

**Si todo funciona correctamente, deberías ver:**

```
=== PRODUCT SERVICE: Agregando producto ===
Datos del producto: {name: "Producto Test", ...}
Usuario actual en Firebase: {uid: "...", ...}
Guardando en Firestore: {...}
Producto guardado exitosamente con ID: ...
```

**Si hay errores, verás:**

```
Error adding product: FirebaseError: Missing or insufficient permissions
```

### 6. Solución de Emergencia

**Si nada funciona, usa esta configuración temporal:**

1. **En Firebase Console > Authentication > Sign-in method**
   - Asegúrate de que "Email/Password" esté habilitado

2. **En Firebase Console > Firestore Database > Rules**
   - Usa las reglas más permisivas (Opción A arriba)

3. **Reinicia todo:**
   - Cierra el navegador
   - En terminal: Ctrl+C, luego `npm start`
   - Abre la app nuevamente
   - Inicia sesión desde cero

### 7. Información para Soporte

**Si sigues teniendo problemas, comparte:**

1. **Captura de pantalla** de la consola del navegador
2. **Resultado** del comando de diagnóstico (paso 2)
3. **Tipo de usuario** con el que iniciaste sesión
4. **Captura** de las reglas actuales en Firebase Console

---

## Contacto Rápido

**Problema más común:** Usuario no autenticado correctamente
**Solución rápida:** Cerrar sesión → Iniciar sesión → Probar nuevamente

**Problema secundario:** Reglas muy restrictivas
**Solución rápida:** Usar reglas permisivas temporales (Opción A)