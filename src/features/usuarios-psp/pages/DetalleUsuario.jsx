import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  cargarUsuario,
  consultarProveedor,
  limpiarProveedor,
  revocarIdentidadDeUsuario,
  traerImagenesDelProveedor,
} from "../store/usuariosPspSlice";
import CategoriaIdentidad from "../components/CategoriaIdentidad";
import ConsultaProveedor from "../components/ConsultaProveedor";
import ModalRevocar from "../components/ModalRevocar";
import { Aviso, Bajada, Chip, Panel, Tabla, Titulo } from "components/Panel";

const DetalleUsuario = () => {
  const { usuarioSub } = useParams();
  const dispatch = useDispatch();
  const { usuario, cargandoUsuario, error, proveedor, revocando } = useSelector(
    (s) => s.usuariosPsp
  );
  const [confirmandoRevocacion, setConfirmandoRevocacion] = useState(false);

  useEffect(() => {
    dispatch(cargarUsuario(usuarioSub));
    return () => dispatch(limpiarProveedor());
  }, [dispatch, usuarioSub]);

  const revocarConMotivo = async (motivo) => {
    setConfirmandoRevocacion(false);
    await dispatch(revocarIdentidadDeUsuario({ usuarioSub, motivo }));
  };

  if (cargandoUsuario) return <p>Cargando usuario…</p>;

  if (!usuario)
    return (
      <>
        <Titulo>Usuario</Titulo>
        {error ? (
          <Aviso $tono="error">{error}</Aviso>
        ) : (
          <Aviso>No encontramos a este usuario en el realm psp.</Aviso>
        )}
      </>
    );

  const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ");
  const validacionId = usuario.identidad?.validacionId ?? null;

  return (
    <>
      <Titulo>{usuario.mail ?? usuario.usuarioSub}</Titulo>
      <Bajada>
        {nombre || "Sin nombre cargado"} ·{" "}
        {usuario.habilitado ? "habilitado" : "deshabilitado"}
      </Bajada>

      {error ? <Aviso $tono="error">{error}</Aviso> : null}

      <Panel>
        <h2>Datos</h2>
        <Tabla>
          <tbody>
            <tr>
              <th>Mail</th>
              <td>{usuario.mail ?? "—"}</td>
            </tr>
            <tr>
              <th>Nombre</th>
              <td>{nombre || "—"}</td>
            </tr>
            <tr>
              <th title="Identificador del usuario en el realm psp. No cambia nunca, a diferencia del mail.">
                Sub
              </th>
              <td>{usuario.usuarioSub ?? "—"}</td>
            </tr>
            <tr>
              <th>Roles</th>
              <td>
                {usuario.roles.length === 0
                  ? "—"
                  : usuario.roles.map((rol) => (
                      <Chip key={rol} style={{ marginRight: 4 }}>
                        {rol}
                      </Chip>
                    ))}
              </td>
            </tr>
            <tr>
              <th>Habilitado</th>
              <td>{usuario.habilitado ? "Sí" : "No"}</td>
            </tr>
          </tbody>
        </Tabla>
      </Panel>

      <CategoriaIdentidad
        identidad={usuario.identidad}
        revocando={revocando}
        onRevocar={() => setConfirmandoRevocacion(true)}
      />

      <ConsultaProveedor
        estado={proveedor}
        validacionId={validacionId}
        onConsultar={() => dispatch(consultarProveedor({ validacionId }))}
        onTraerImagenes={() =>
          dispatch(traerImagenesDelProveedor({ validacionId }))
        }
        onDescartar={() => dispatch(limpiarProveedor())}
      />

      {confirmandoRevocacion ? (
        <ModalRevocar
          mail={usuario.mail}
          revocando={revocando}
          onCancelar={() => setConfirmandoRevocacion(false)}
          onConfirmar={revocarConMotivo}
        />
      ) : null}
    </>
  );
};

export default DetalleUsuario;
