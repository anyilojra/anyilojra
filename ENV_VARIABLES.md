# Variables de Entorno Requeridas

Tu proyecto está configurado y listo, pero necesitas agregar las siguientes variables de entorno en Vercel para que funcione correctamente.

## ✅ Supabase (Ya están configuradas)

```
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
POSTGRES_URL=xxx
```

## ⚠️ Requeridas para Build (CRÍTICAS)

Estas variables son necesarias durante el build:

```
BETTER_AUTH_SECRET=tu_secret_aqui
BETTER_AUTH_URL=https://tu-dominio.vercel.app
```

### Generar BETTER_AUTH_SECRET

Corre este comando en tu terminal:

```bash
openssl rand -base64 32
```

Copia el resultado y pégalo como `BETTER_AUTH_SECRET` en Vercel.

## 📧 Opcionales (Para funcionalidad completa)

Estas variables son opcionales pero recomendadas:

```
# Correos - Resend
RESEND_API_KEY=tu_api_key_de_resend

# Tienda Online
NEXT_PUBLIC_SITE_URL=https://www.nevada.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...

# Admin
NEXT_PUBLIC_ADMIN_EMAIL=admin@nevada.com
```

## 🚀 Pasos para Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las variables **CRÍTICAS** (BETTER_AUTH_SECRET y BETTER_AUTH_URL)
4. (Opcional) Agrega las variables adicionales según necesites
5. Haz nuevo deployment

## 📋 Checklist

- [ ] BETTER_AUTH_SECRET configurado
- [ ] BETTER_AUTH_URL apuntando a tu dominio en Vercel
- [ ] Supabase URL y keys (ya están)
- [ ] Build exitoso en Vercel
- [ ] Sitio funcionando

¡Listo! Tu proyecto está 100% configurado.
