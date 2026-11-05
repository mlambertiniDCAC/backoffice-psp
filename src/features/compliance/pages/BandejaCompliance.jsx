import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { cargarBandeja } from "../store/complianceSlice";
import { ESTADOS_COMPLIANCE } from "src/lib/constants";
import {
  Aviso,
  Bajada,
  Chip,
  Fila,
  Boton,
  Panel,
  Tabla,
  Titulo,
} from "components/Panel";

const BandejaCompliance = () => {
  const dispatch = useDispatch();
  const { filas, cargando, error, estado } = useSelector((s) => s.compliance);

  useEffect(() => {
    dispatch(cargarBandeja({ estado: "en_revision" }));
  }, [dispatch]);

  return (
    <>
      <Titulo>Compliance</Titulo>
      <Bajada>
        Legajos por estado. Un legajo en progreso no aparece acá: el backend no
        lo devuelve en el listado.
      </Bajada>

      {error ? <Aviso $tono="error">{error}</Aviso> : null}

      <Panel>
        <Fila>
          {ESTADOS_COMPLIANCE.map((e) => (
            <Boton
              key={e.value}
              type="button"
              $primario={estado === e.value}
              onClick={() => dispatch(cargarBandeja({ estado: e.value }))}
            >
              {e.label}
            </Boton>
          ))}
        </Fila>
      </Panel>

      <Panel>
        {cargando ? (
          <p>Cargando…</p>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <th>Sujeto</th>
                <th>Ref externa</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Docs por revisar</th>
                <th>Cuenta CVU</th>
                <th>Desde</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 ? (
                <tr>
                  <td colSpan={8}>No hay legajos en este estado.</td>
                </tr>
              ) : (
                filas.map((f) => (
                  <tr key={f.complianceId}>
                    <td>{f.sujetoVerificadoId ?? "—"}</td>
                    <td>
                      {f.refExterna ?? (
                        <Chip title="El listado no trajo ref_externa: las acciones que la necesitan quedan deshabilitadas">
                          sin ref_externa
                        </Chip>
                      )}
                    </td>
                    <td>{f.tipo ?? "—"}</td>
                    <td>
                      <Chip>{f.estado}</Chip>
                    </td>
                    <td>
                      {f.documentosPorRevisar} de {f.documentosTotal}
                    </td>
                    <td>
                      {f.cuenta ? (
                        <Chip>{f.cuenta.situacion}</Chip>
                      ) : (
                        <Chip>sin cuenta</Chip>
                      )}
                    </td>
                    <td>{f.fechaCreacion ?? "—"}</td>
                    <td>
                      <Link to={`/compliance/${f.sujetoVerificadoId}`}>
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Tabla>
        )}
      </Panel>
    </>
  );
};

export default BandejaCompliance;
