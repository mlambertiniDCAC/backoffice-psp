import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  cargarCuentas,
  irAPagina,
  selectPagina,
  selectTotalPaginas,
} from "../store/cuentasSlice";
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

const ListadoCuentas = () => {
  const dispatch = useDispatch();
  const { cargando, error, lista, pagina } = useSelector((s) => s.cuentas);
  const visibles = useSelector(selectPagina);
  const totalPaginas = useSelector(selectTotalPaginas);
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    dispatch(cargarCuentas());
  }, [dispatch]);

  return (
    <>
      <Titulo>Cuentas CVU</Titulo>
      <Bajada>
        {lista.length} cuentas. El backend no pagina este listado, así que la
        paginación es del lado del front.
      </Bajada>

      {error ? <Aviso $tono="error">{error}</Aviso> : null}

      <Panel>
        <Fila>
          <input
            aria-label="Filtrar por clientId"
            placeholder="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
          <Boton
            type="button"
            onClick={() =>
              dispatch(cargarCuentas(clientId ? { clientId } : {}))
            }
          >
            Filtrar
          </Boton>
          <Boton
            type="button"
            onClick={() => {
              setClientId("");
              dispatch(cargarCuentas());
            }}
          >
            Limpiar
          </Boton>
        </Fila>
      </Panel>

      <Panel>
        {cargando ? (
          <p>Cargando…</p>
        ) : (
          <>
            <Tabla>
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th>Sujeto</th>
                  <th>CUIT</th>
                  <th>Titular</th>
                  <th>CVU</th>
                  <th>Situación</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visibles.length === 0 ? (
                  <tr>
                    <td colSpan={7}>Sin cuentas.</td>
                  </tr>
                ) : (
                  visibles.map((c) => (
                    <tr key={c.cuentaIdExterno}>
                      <td>{c.cuentaIdExterno}</td>
                      <td>{c.sujetoVerificadoId ?? "—"}</td>
                      <td>{c.cuit ?? "—"}</td>
                      <td>{c.titular ?? "—"}</td>
                      <td>{c.cvu ?? "—"}</td>
                      <td>
                        <Chip>{c.situacion ?? "—"}</Chip>
                      </td>
                      <td>
                        <Link to={`/cuentas/${c.cuentaIdExterno}`}>Abrir</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Tabla>
            <Fila style={{ marginTop: 12 }}>
              <Boton
                type="button"
                disabled={pagina <= 1}
                onClick={() => dispatch(irAPagina(pagina - 1))}
              >
                Anterior
              </Boton>
              <span>
                Página {pagina} de {totalPaginas}
              </span>
              <Boton
                type="button"
                disabled={pagina >= totalPaginas}
                onClick={() => dispatch(irAPagina(pagina + 1))}
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

export default ListadoCuentas;
