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

- **Necesita un usuario con rol `admin` del realm `psp`.** El login devuelve **solo
  el token opaco**, no el rol, así que el front no sabe de antemano si la sesión es
  admin: con un usuario que no lo sea, las pantallas responden 403. Tampoco puede ser
  el mismo usuario que un cliente, porque el login del gateway bifurca por rol.
- **`GET /v1/movimientos` no sirve desde acá.** Está detrás del guard de permisos de
  `ms-psp`, que exige un vínculo con `ver-psp` sobre el sujeto, y un admin no lo tiene.
  Por eso el detalle de cuenta no muestra movimientos.
- **El alta de una cuenta CVU le pega a BIND de verdad** y la cuenta queda escrita en
  el banco. El `DELETE` de una cuenta ejecuta la baja del CVU y es irreversible. Las
  dos pasan por una confirmación que nombra lo que va a pasar.
- **La sesión admin vence a los ~5 minutos y hoy no se puede renovar.** El
  interceptor llama a `POST /v1/auth/refresh` ante un 401, pero esa ruta exige que la
  sesión guardada tenga `refresh_token`, y Keycloak no lo está devolviendo para el
  `grant_type: password` del client de la app. El gateway lo guardaría si viniera
  (`session.service.ts` lo persiste), así que **es configuración del client en
  Keycloak**, no del gateway ni de este front. Peor: cuando el refresh falla, el
  gateway **destruye la sesión** antes de responder 401.

  Mientras tanto, el front detecta el caso y vuelve al login con el motivo a la vista,
  sin recargar la página. Ojo que el login está limitado a **10 por minuto para todo
  el ambiente**: una sesión que muere cada 5 minutos consume ese presupuesto rápido.

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

El listado de compliance devuelve `sujeto_verificado_id`, no `ref_externa`. **La
`ref_externa` se deriva del `client_id` de la cuenta CVU**: el gateway crea la cuenta
con `clientId: Number(refExterna)`, así que son el mismo valor. El front cruza el
listado de compliance contra `GET /v1/cuentas` por `sujeto_verificado_id` y toma el
`client_id` — el mismo cruce que ya hace para mostrar el estado de la cuenta.

Un sujeto que todavía no tiene cuenta no tiene de dónde derivarla; en ese caso el
detalle del legajo pide la `ref_externa` a mano, que es el id de la sociedad en la
plataforma origen.

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
