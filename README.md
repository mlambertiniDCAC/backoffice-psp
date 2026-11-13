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

| Sección                 | Qué resuelve                                                                                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Compliance**          | Bandeja por estado, detalle del legajo, revisión documento por documento, personas, y aceptar / rechazar / bloquear / desbloquear / reiniciar                                            |
| **Altas trabadas**      | Cuentas `EN_PROCESO` sin CVU. **Reintentar el alta** (crea la CVU en BIND), **Sincronizar permisos** (no toca el banco), informar un CVU que BIND ya creó, y guardar CUIT y razón social |
| **Cuentas**             | Listado, detalle, alias, baja                                                                                                                                                            |
| **Permisos por cuenta** | Vínculos usuario↔cuenta, revocar, re-sincronizar desde el legajo, y la vista de permisos del sujeto                                                                                      |
| **Usuarios**            | Usuarios del realm `psp`: listado con búsqueda y paginado, detalle, y la categoría de identidad (validación biométrica) con su historial y la consulta al proveedor                      |

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

## Reintentar un alta no es sincronizar

`POST /v1/compliance/:ref/permisos/sincronizar` solo crea la cuenta en BIND **si el
body trae `cuit` y `name`**. Sin ellos, `asegurarCuenta` del gateway ve que ya existe
una cuenta en `EN_PROCESO` y la devuelve tal cual: responde 200, no llama al banco y
no cambia nada — verificado contra la base de stage, donde tres reintentos con body
vacío no dejaron ni una llamada al bridge.

- **Reintentar el alta** → body `{cuit, name}`. Le pega a BIND y crea la CVU.
- **Sincronizar permisos** → body vacío. Rehace vínculos y permisos de un legajo ya
  aceptado, para el caso "compliance aceptado, permisos pendientes".

BIND es estricto con la razón social: un nombre con comas o con `< >` vuelve como
`PA015` ("el campo titular no cumple con el formato requerido") y la cuenta queda
trabada.

**El motivo del rechazo no se muestra en la UI, a propósito.** `ms-psp` envuelve el
rechazo de BIND en un `BadGatewayException('No se pudo obtener CVU')` sin el código
del proveedor, y el gateway reemplaza el cuerpo de todo 5xx: el `GE500` no sale del
backend. Mostrar un "el servicio respondió 502" en cada fila sería ruido, así que la
pantalla solo avisa que la acción falló. **El motivo real está en
`psp.psp_bridge_errors`**, que lo guarda antes de que se pierda. Que llegue a la
pantalla exige cambiar `ms-psp` para mapear el rechazo a un 4xx con el código, y eso
quedó fuera de alcance por decisión del equipo.

## La sección de Usuarios no es la de Permisos por cuenta

Son dos cosas distintas y el menú las separa:

- **Permisos por cuenta** (`/usuarios`, `src/features/usuarios/`) administra **vínculos y
  permisos de una cuenta CVU**. Su store consume la API de cuentas; no hay ninguna API de
  usuarios detrás. Antes se llamaba "Usuarios y permisos", que es lo que confundía.
- **Usuarios** (`/usuarios-psp`, `src/features/usuarios-psp/`) es el **padrón del realm `psp`**:
  mail, nombre, roles, si está habilitado, y si tiene la identidad validada. De ahí se entra al
  detalle del usuario.

Viven separadas a propósito: comparten el nombre "usuario" pero no el sujeto, ni la API, ni el
store.

### La categoría de identidad del detalle

Muestra lo que el perímetro **sí guarda** de la validación biométrica: estado (validada, en
curso, revocada), desde cuándo, el documento y el CUIL que quedaron, los dos flags de
discrepancia y el historial de intentos.

- Los flags **`nombre_difiere` y `cuit_difiere` se muestran en palabras**, no como booleanos.
  Significan que lo que la persona declaró en el alta no coincide con lo que dice su documento.
  4i contrasta la cara contra la foto de RENAPER, pero **no verifica los datos declarados**: esa
  comparación es nuestra, y los flags marcan la diferencia sin bloquear a nadie.
- De cada intento, el **motivo del corte se muestra en castellano**, traducido del grupo al que
  pertenece el `step` de 4i. El código del `step` va en su propia columna, para quien lo necesite.
- Un `step` del rango 9000-9999 significa dispositivo bloqueado, y los últimos tres dígitos son
  los minutos que faltan: la pantalla los muestra como minutos.

### La consulta al proveedor

El domicilio, la fecha de nacimiento, el score del cotejo facial, la vigencia del documento y
las tres fotos (frente, dorso y selfie) **no están en ninguna base nuestra**: se le piden a 4i en
el momento y no se persisten. Por eso la consulta es un botón aparte, con confirmación, y la
pantalla dice las tres cosas que importan: que se está consultando al proveedor, que la consulta
queda auditada, y que son datos personales y biométricos.

Las **fotos se piden en una segunda llamada**, nunca de entrada: pesan cientos de kilobytes cada
una. Nada de lo consultado se guarda: no va a `localStorage`, no va a ningún store persistido, y
se descarta al salir del detalle o con el botón de descartar.

La consulta es **sobre una validación, no sobre la persona**: va contra la última validación
cerrada que figura en el detalle. Si la persona nunca cerró una, no hay transacción de 4i que
consultar y el botón no aparece.

### El contrato de la sección de Usuarios

Las tres rutas son solo de rol `admin` y cuelgan de `/v1/admin/identidad/`, el prefijo que
`apigateway-psp` expone. El front las consume desde `src/lib/api/usuarios.js` y adapta las
respuestas en `src/lib/identidad.js`: si el backend cambia de forma, esos dos archivos son los
que hay que tocar.

```jsonc
// GET /v1/admin/identidad/usuarios?desde=0&cantidad=20&texto=
{
  "total": 137,
  "desde": 0,
  "cantidad": 20,
  "usuarios": [
    {
      "sub": "…uuid…",
      "mail": "ana@ejemplo.com",
      "nombre": "Ana",
      "apellido": "Pérez",
      "habilitado": true,
      "roles": ["usuario"],
      "identidad": { "validada": true, "validada_en": "…", "revocada_en": null, "validacion_en_curso": false }
    }
  ]
}

// GET /v1/admin/identidad/usuarios/{sub}
{
  "sub": "…uuid…", "mail": "…", "nombre": "…", "apellido": "…",
  "habilitado": true, "roles": ["usuario"],
  "identidad": {
    "validada": true, "validada_en": "…",
    "revocada_en": null, "revocada_por": null, "motivo_revocacion": null,
    "documento": "44560910", "cuil": "20445609103",
    "nombre_difiere": false, "cuit_difiere": false,
    "citizen_id": "…uuid…", "validacion_id": 3,
    "validaciones": [
      { "id": 3, "flujo": "onboarding", "estado": "FINALIZADA", "resultado": "success",
        "step": null, "grupo": "SIN_GRUPO", "descripcion": null, "minutos_bloqueo": null,
        "iniciada_en": "…", "finalizada_en": "…", "expira_en": "…" }
    ]
  }
}

// GET /v1/admin/identidad/validaciones/{validacionId}/proveedor?imagenes=false
{
  "validacion_id": 3, "usuario_sub": "…uuid…",
  "trx_id": "01M79D6MVBGXQ17D271GY6TPAS",
  "consultado_en": "…", "con_imagenes": false,
  "domicilio": { "calle": "EOLO", "numero": "833", "piso": null, "departamento": null,
                 "localidad": "PINAMAR", "provincia": "BUENOS AIRES", "codigo_postal": null,
                 "formateado": "EOLO, 833, PINAMAR" },
  "fecha_nacimiento": "21/12/2002",
  "score_cotejo_facial": 96,
  "documento": { "numero": "44560910", "vigente": true, "vigencia_hasta": "08/10/2037" },
  "imagenes": null
}
// con imagenes=true, `imagenes` trae { frente, dorso, selfie } en base64 o data url
```

Lo que hay que tener en cuenta de ese contrato:

- **El listado pagina por offset**, no por número de página: `desde` arranca en 0 y `cantidad`
  vale 20 por defecto, con tope 50. La pantalla sigue mostrando "Página N de M", pero la calcula
  dividiendo el `desde` por la `cantidad` que devolvió el backend.
- **`texto` tiene un mínimo de 4 caracteres**: con menos, el gateway responde 400. La pantalla no
  deja llegar hasta ahí — deshabilita el botón de buscar y explica el motivo, que es que el WAF
  del ingress corta con 403 los valores exactos `sh`, `ls` y `env` en la query y ese 403 nunca
  llega a la aplicación.
- **Cada fila del listado trae su objeto `identidad`** siempre: un usuario sin fila de identidad
  viene con los cuatro campos en `false`/`null`, nunca con la clave en `null` ni ausente.
- **El identificador del usuario es `sub`**, tanto en el listado como en el detalle. El detalle no
  trae fecha de creación, así que la pantalla no la muestra.
- **La consulta al proveedor se indexa por id de validación**, no por `sub`: el id sale de
  `identidad.validacion_id` del detalle, que es la última validación cerrada. Un usuario sin
  ninguna no tiene nada que consultar y la pantalla no ofrece el botón.
- `imagenes` solo acepta `true` o `false`; cualquier otro valor es 400, así que el cliente lo
  manda siempre como booleano.
- **`documento.vigente` tiene tres estados**: `true`, `false` y `null`. El `null` significa que el
  check no trajo el dato, no que el documento no esté vigente, así que la pantalla muestra
  "Vigente", "No vigente" y "Sin dato de vigencia" como tres cosas distintas. Es el mismo criterio
  que `nombre_difiere`.
- `domicilio` y `documento` vienen **siempre completos**, con todas sus claves, aunque todos los
  valores sean `null`. Los campos vacíos de 4i llegan normalizados a `null`, nunca como `""`, así
  que preguntar si la clave existe no discrimina nada: hay que mirar el valor.
- Los errores del proveedor se propagan sin interpretar: 404 si la validación no existe, 409 si no
  tiene `trx_id`, 502 si 4i no responde. Se muestran en el panel de la consulta y no como error de
  la pantalla.

De cada intento, el **motivo del corte sale de `descripcion`**; si no viene, el front traduce el
`grupo`. Si tampoco hay grupo conocido, muestra "—" y deja el `step` a la vista: no inventa un
motivo. Los minutos de bloqueo salen de `minutos_bloqueo` y, si no viene, de los últimos tres
dígitos de un `step` del rango 9000-9999. Del bloque de identidad, `citizen_id` y el `expira_en`
de cada intento se adaptan pero todavía no se muestran; del proveedor, `formateado` se usa solo
como respaldo cuando el domicilio viene sin ninguna de sus partes. Un `403` o un error de red se
muestran como error; no hay fallback que simule una respuesta.

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
src/lib/api/      los clientes de apigateway-psp (auth, compliance, cuentas, usuarios)
src/lib/          adaptadores de dominio, vocabulario de identidad, constantes, axios, storage
src/features/     compliance · altas · cuentas · usuarios · usuarios-psp (páginas + store)
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
