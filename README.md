# backoffice-psp

Backoffice de administración del perímetro **PSP** (el módulo financiero). Es un
**MFE** React + Vite que consume **solo `apigateway-psp`**: no habla con `ms-psp`,
`ms-compliance`, `ms-multimedia-psp`, Keycloak ni la API de DCAC.

Es una **herramienta interna de devs y operaciones**, no un producto para staff de
negocio. Varias pantallas muestran códigos de proveedor y texto técnico a propósito.

## Arrancar

```bash
npm install
cp .env.example .env     # completar APIGW_PSP_URL
npm run dev              # :5177
```

Expone `remoteEntry.js` (Module Federation, `name: backofficePsp`, `./App`), igual
que `onboarding-psp` y `gestor-cuentas-mfe`, así que también se puede montar dentro
de un shell.

## Qué hace

| Sección                 | Qué resuelve                                                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Compliance**          | Bandeja por estado, detalle del legajo, revisión documento por documento, personas, y aceptar / rechazar / bloquear / desbloquear / reiniciar                   |
| **Altas trabadas**      | Cuentas `EN_PROCESO` sin CVU, con **el motivo real del fallo a la vista**. Reintento vía sincronizar, informar un CVU que BIND ya creó, y corregir CUIT/titular |
| **Cuentas**             | Listado, detalle, alias, baja                                                                                                                                   |
| **Usuarios y permisos** | Vínculos usuario↔cuenta, revocar, re-sincronizar desde el legajo, y la vista de permisos del sujeto                                                             |

## Lo que hay que saber antes de usarlo

- **Necesita un usuario con rol `admin` del realm `psp`.** No puede ser el mismo
  usuario que un cliente: el login del gateway bifurca por rol.
- **El alta de una cuenta CVU le pega a BIND de verdad** y la cuenta queda escrita en
  el banco. El `DELETE` de una cuenta ejecuta la baja del CVU y es irreversible. Las
  dos pasan por una confirmación que nombra lo que va a pasar.
- **La sesión admin vence a los ~5 minutos.** El interceptor renueva con
  `POST /v1/auth/refresh`; si eso falla, vuelve al login. El login está limitado a
  **10 por minuto para todo el ambiente**, así que no conviene reintentar en loop.
- **El dominio del deploy tiene que estar en `CORS_ORIGINS` del gateway.** La
  comparación es exacta, sin comodines, y cada preview de Vercel tiene dominio
  propio. Es lo primero a revisar si "no anda".

## Los dos identificadores

La trampa del dominio, y el front la modela explícita:

| Identificador          | Rutas que lo toman                                           |
| ---------------------- | ------------------------------------------------------------ |
| `refExterna`           | `aceptar`, `bloquear`, `desbloquear`, `permisos/sincronizar` |
| `sujeto_verificado_id` | el resto de `/v1/compliance`, y todo `/v1/admin/compliance`  |
| `cuentaIdExterno`      | todo `/v1/cuentas`                                           |

Si el listado no trae `ref_externa`, las acciones que la necesitan quedan
deshabilitadas con el motivo a la vista, en vez de pegarle a una URL inválida.

## Estructura

```
src/lib/api/      los tres clientes de apigateway-psp (auth, compliance, cuentas)
src/lib/          adaptadores de dominio, constantes, axios con refresh, storage
src/features/     compliance · altas · cuentas · usuarios (páginas + store)
src/components/   primitivas de UI y el modal de confirmación
```

## Tests

```bash
npm test     # vitest, un solo worker a propósito
```

El paralelismo por defecto de vitest hace fallar los tests con
`Timeout calling fetch /@vite/env`: es presión de memoria, no un problema del test.

## Deploy

Vercel, con el rewrite de SPA que ya está en `vercel.json`. El build de producción
**falla a propósito** si falta `APIGW_PSP_URL`.
