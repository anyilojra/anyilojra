# Despliegue a Vercel - Guia Paso a Paso

## Paso 1: Preparar Variables de Entorno

Necesitarás obtener estas variables de Supabase:

1. **POSTGRES_URL** - Connection string de PostgreSQL
   - En Supabase: Settings → Database → Connection String
   
2. **SUPABASE_URL** - URL de tu proyecto
   - En Supabase: Settings → API
   
3. **SUPABASE_ANON_KEY** - Anon public key
   - En Supabase: Settings → API
   
4. **SUPABASE_SERVICE_ROLE_KEY** - Service role key
   - En Supabase: Settings → API

## Paso 2: Subir a GitHub

```bash
git add .
git commit -m "feat: Supabase integration configured"
git push origin main
```

## Paso 3: Importar a Vercel

1. Ve a vercel.com/dashboard
2. Click "Add New" → "Project"
3. Selecciona tu repositorio
4. Antes de desplegar, agrega las variables de entorno

## Paso 4: Agregar Variables en Vercel

En el formulario de importación:

```
POSTGRES_URL=postgresql://...
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Paso 5: Desplegar

Click en "Deploy" y espera a que termine.

## Verificar Migraciones

1. En Vercel: Deployments → [Tu deployment] → Logs
2. Busca: "Running database migrations"
3. Si ves "Migrations completed", ¡todo está bien!

## Verificar Tablas en Supabase

1. En Supabase: SQL Editor
2. Ejecuta:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Deberías ver 13 tablas creadas.

---

Listo! Tu aplicacion está desplegada y conectada a Supabase.
