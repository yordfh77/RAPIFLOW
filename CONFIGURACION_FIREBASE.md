# Configuración de Firebase para RapiFlow

## Problema Actual
La aplicación no puede agregar productos debido a errores de permisos en Firebase. Los errores que aparecen son:
- "Missing or insufficient permissions"
- "FirebaseError: Missing or insufficient permissions"
- "Error adding product: FirebaseError: Missing or insufficient permissions"

## Solución: Configurar Reglas de Firestore

### Paso 1: Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **rapiflow-b31de**
3. En el menú lateral izquierdo, busca "Firestore Database"
4. Haz clic en "Firestore Database"

### Paso 2: Configurar las Reglas
1. Una vez en Firestore Database, verás varias pestañas en la parte superior
2. Haz clic en la pestaña **"Rules"** (Reglas)
3. Verás un editor de código con las reglas actuales

### Paso 3: Reemplazar las Reglas
Reemplaza **COMPLETAMENTE** el contenido del editor con estas reglas CORREGIDAS:

**IMPORTANTE: Copia exactamente este texto sin modificaciones:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /orders/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /restaurants/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /drivers/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    match /businesses/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /test/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**ALTERNATIVA SIMPLE (si la anterior sigue dando error):**

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

**NOTA:** La alternativa simple permite acceso completo (solo para desarrollo).

### Paso 4: Publicar las Reglas
1. Después de pegar las reglas, verás un botón **"Publish"** (Publicar) en la parte superior derecha
2. Haz clic en **"Publish"**
3. Confirma la acción si te pide confirmación

### Paso 5: Verificar la Configuración
1. Espera unos segundos para que los cambios se apliquen
2. Regresa a tu aplicación en el navegador
3. Intenta agregar un producto nuevamente

## Verificación Adicional: Autenticación

### Asegúrate de estar autenticado
1. En la aplicación, verifica que hayas iniciado sesión correctamente
2. Si no estás seguro, cierra sesión y vuelve a iniciar sesión
3. Usa las credenciales de un usuario tipo "negocio"

### Revisar la consola del navegador
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Intenta agregar un producto
4. Revisa si aparecen mensajes como:
   - "Usuario autenticado: [ID del usuario]"
   - "Guardando en Firestore: [datos del producto]"

## Solución de Problemas

### Si sigues teniendo errores:

1. **Verifica que las reglas se aplicaron correctamente:**
   - Ve a Firebase Console > Firestore Database > Rules
   - Confirma que las reglas incluyen la sección de `products`

2. **Verifica la autenticación:**
   - En la consola del navegador, busca mensajes que digan "Usuario autenticado"
   - Si no aparecen, el problema es de autenticación

3. **Reinicia la aplicación:**
   - Cierra el navegador completamente
   - En la terminal, presiona Ctrl+C para detener el servidor
   - Ejecuta `npm start` nuevamente
   - Abre la aplicación en el navegador

4. **Verifica la configuración de Firebase:**
   - Asegúrate de que el archivo `src/config/firebase.js` tenga la configuración correcta
   - Verifica que el proyecto en Firebase Console sea el correcto

## Contacto
Si después de seguir estos pasos sigues teniendo problemas, comparte:
1. Una captura de pantalla de las reglas en Firebase Console
2. Los mensajes de error de la consola del navegador
3. Confirmación de que estás autenticado en la aplicación

---
**Nota de Seguridad:** Estas reglas son permisivas para desarrollo. En producción, deberías hacer las reglas más restrictivas según tus necesidades específicas.