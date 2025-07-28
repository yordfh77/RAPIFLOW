# Despliegue en Netlify - RapiFlow

## Configuración Completada

La aplicación RapiFlow está lista para ser desplegada en Netlify con la siguiente configuración:

### Archivos de Configuración

1. **netlify.toml** - Configuración principal de Netlify
   - Carpeta de publicación: `dist`
   - Comando de build: `npx expo export --platform web`
   - Redirects configurados para SPA

2. **package.json** - Scripts actualizados
   - `build:web`: `expo export --platform web`
   - `netlify:build`: `npx expo export --platform web`

3. **public/_redirects** - Configuración de enrutamiento
   - Redirige todas las rutas a index.html para SPA

### Pasos para Desplegar

#### Opción 1: Despliegue Automático desde Git

1. Sube el código a un repositorio de GitHub/GitLab/Bitbucket
2. Conecta el repositorio en Netlify
3. Netlify detectará automáticamente la configuración del `netlify.toml`
4. El build se ejecutará automáticamente

#### Opción 2: Despliegue Manual

1. Ejecuta el build localmente:
   ```bash
   npm run build:web
   ```

2. Sube la carpeta `dist` a Netlify:
   - Arrastra la carpeta `dist` al dashboard de Netlify
   - O usa Netlify CLI: `netlify deploy --prod --dir=dist`

### Variables de Entorno

Asegúrate de configurar las siguientes variables de entorno en Netlify:

- Variables de Firebase (si las usas)
- Cualquier API key necesaria
- Variables de configuración específicas de producción

### Funcionalidades Verificadas

✅ Autenticación de usuarios (Cliente, Negocio, Repartidor)
✅ Navegación entre pantallas
✅ Botones de logout funcionando
✅ Iconos corregidos (business en lugar de storefront)
✅ Compatibilidad con React Native Web
✅ Configuración de redirects para SPA

### Notas Importantes

- La aplicación usa `window.confirm` y `window.alert` para mejor compatibilidad web
- Los iconos de Ionicons están configurados correctamente
- El enrutamiento está configurado para funcionar como SPA
- Firebase debe estar configurado para el dominio de producción

### Solución de Problemas

Si encuentras problemas:

1. Verifica que todas las variables de entorno estén configuradas
2. Revisa los logs de build en Netlify
3. Asegúrate de que Firebase permita el dominio de producción
4. Verifica que no haya errores de CORS

### Comandos Útiles

```bash
# Build local
npm run build:web

# Servidor de desarrollo
npm run web

# Netlify CLI deploy
netlify deploy --prod --dir=dist
```