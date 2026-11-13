import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  cargarUsuarios,
  selectPagina,
  selectTotalPaginas,
} from "../store/usuariosPspSlice";
import {
  AVISO_BUSQUEDA_CORTA,
  MINIMO_TEXTO_BUSQUEDA,
  etiquetaDeIdentidad,
} from "src/lib/identidad";
import {
  Aviso,
  Bajada,
  Boton,
  Chip,
  Fila,
  Panel,
  Tabla,
  Titulo,
} from "components/Panel";

const ListadoUsuarios = () => {
  const dispatch = useDispatch();
  const { lista, total, desde, cantidad, texto, cargando, error } = useSelector(
    (s) => s.usuariosPsp
  );
  const totalPaginas = useSelector(selectTotalPaginas);
  const pagina = useSelector(selectPagina);
  const [entrada, setEntrada] = useState("");

  useEffect(() => {
    dispatch(cargarUsuarios());
  }, [dispatch]);

  const escrito = entrada.trim();
  const demasiadoCorto =
    escrito.length > 0 && escrito.length < MINIMO_TEXTO_BUSQUEDA;

  const buscarAhora = () => {
    if (demasiadoCorto) return;
    dispatch(cargarUsuarios({ texto: escrito }));
  };

  return (
    <>
      <Titulo>Usuarios del realm psp</Titulo>
      <Bajada>
        {total} usuarios. La columna de identidad dice si la persona pasó la
        validación biométrica; el detalle muestra con qué datos quedó.
      </Bajada>

      {error ? <Aviso $tono="error">{error}</Aviso> : null}

      <Panel>
        <Fila>
          <input
            aria-label="Buscar usuario"
            placeholder="mail, nombre o apellido"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") buscarAhora();
            }}
          />
          <Boton type="button" disabled={demasiadoCorto} onClick={buscarAhora}>
            Buscar
          </Boton>
          <Boton
            type="button"
            onClick={() => {
              setEntrada("");
              dispatch(cargarUsuarios());
            }}
          >
            Limpiar
          </Boton>
        </Fila>
        {demasiadoCorto ? <Aviso>{AVISO_BUSQUEDA_CORTA}</Aviso> : null}
        {texto ? (
          <Bajada style={{ margin: "10px 0 0" }}>
            Filtrando por “{texto}”.
          </Bajada>
        ) : null}
      </Panel>

      <Panel>
        {cargando ? (
          <p>Cargando…</p>
        ) : (
          <>
            <Tabla>
              <thead>
                <tr>
                  <th>Mail</th>
                  <th>Nombre</th>
                  <th>Roles</th>
                  <th>Habilitado</th>
                  <th>Identidad</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lista.length === 0 ? (
                  <tr>
                    <td colSpan={6}>Sin usuarios para mostrar.</td>
                  </tr>
                ) : (
                  lista.map((u) => (
                    <tr key={u.usuarioSub}>
                      <td>{u.mail ?? "—"}</td>
                      <td>
                        {[u.nombre, u.apellido].filter(Boolean).join(" ") ||
                          "—"}
                      </td>
                      <td>
                        {u.roles.length === 0
                          ? "—"
                          : u.roles.map((rol) => (
                              <Chip key={rol} style={{ marginRight: 4 }}>
                                {rol}
                              </Chip>
                            ))}
                      </td>
                      <td>{u.habilitado ? "Sí" : "No"}</td>
                      <td>
                        <Chip>{etiquetaDeIdentidad(u.identidad)}</Chip>
                      </td>
                      <td>
                        <Link to={`/usuarios-psp/${u.usuarioSub}`}>Abrir</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Tabla>
            <Fila style={{ marginTop: 12 }}>
              <Boton
                type="button"
                disabled={desde <= 0}
                onClick={() =>
                  dispatch(
                    cargarUsuarios({
                      texto,
                      desde: Math.max(0, desde - cantidad),
                    })
                  )
                }
              >
                Anterior
              </Boton>
              <span>
                Página {pagina} de {totalPaginas}
              </span>
              <Boton
                type="button"
                disabled={pagina >= totalPaginas}
                onClick={() =>
                  dispatch(cargarUsuarios({ texto, desde: desde + cantidad }))
                }
              >
                Siguiente
              </Boton>
            </Fila>
          </>
        )}
      </Panel>
    </>
  );
};

export default ListadoUsuarios;
