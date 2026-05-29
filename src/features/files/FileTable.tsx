// @ts-nocheck
import React from "react";
import { cls } from "../../lib/cls";
import { prettyBytes } from "../../lib/bytes";
import { formatDate } from "../../lib/time";
import { statusBadgeClasses, Th, typeBadge } from "../shared/uiHelpers";
import {
  pendingDudasCount, answeredDudasCount,
  pendingArreglosCount, answeredArreglosCount,
} from "../observations/observationHelpers";
import { RowMenuPortal } from "./RowMenuPortal";
import Avatar from "../../components/Avatar";

export function FileTable({
  filtered, periodNameById, selectedPeriodId,
  effectiveStatus, displayStatusForRole, meRole, myPerms,
  isAdmin, isSuperAdmin, selectAllRef, allVisibleSelected, visibleIds,
  selectedIds, selectAllVisible, deselectAllVisible, isSelected, toggleSelectOne,
  setSelected, setDetailOpen, setSelectedThreadId,
  handleStatusChange, setObserveDialog, blankObsRow, openFileDoubt,
  openAdjustForFile, deleteFile, doDownload, markDownloaded, bumpVersion,
  rowMenuOpen, setRowMenuOpen, rowMenuAnchor, setRowMenuAnchor,
  MENU_TRIGGER, MENU_ITEM, me, usersSnap,
}: any) {
  // Lookup rápido por id de usuario
  const userById = React.useMemo(() => {
    const m = {};
    (usersSnap || []).forEach(u => { m[u.id] = u; });
    return m;
  }, [usersSnap]);
  return (
    <section className="rounded-2xl border border-neutral-800 overflow-visible">
        <div className="px-4 py-2.5 text-xs text-neutral-400 bg-neutral-900/50 border-b border-neutral-800 rounded-t-2xl">
          Mostrando archivos de:{" "}
          <span className="text-neutral-200 font-medium">
            {periodNameById[selectedPeriodId] || "—"}
          </span>
        </div>

        {/* Importante:
            - La sección NO recorta (overflow-visible)
            - Solo la tabla scrollea horizontalmente (overflow-x-auto)
            - El dropdown puede "flotar" por arriba */}
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900/60 text-neutral-300 border-b border-neutral-800">
              <tr>
                <Th>
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(e) => {
                      if (e.target.checked) selectAllVisible(visibleIds);
                      else deselectAllVisible(visibleIds);
                    }}
                    title="Seleccionar todos (vista filtrada)"
                  />
                </Th>
                <Th>Archivo</Th>
                <Th>Usuario</Th>
                <Th>Tipo</Th>
                <Th>Versión</Th>
                <Th>Estado</Th>
                <Th>Dudas/Arreglos</Th>
                <Th>Subido</Th>
                <Th></Th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-neutral-500">
                    No hay archivos en esta liquidación.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr
                    key={f.id}
                    className={cls(
                      "border-t border-neutral-800",
                      effectiveStatus(f) === "eliminado"
                        ? "bg-red-950/30 opacity-75"
                        : "hover:bg-neutral-900/40"
                    )}
                  >
                    {/* Checkbox de selección */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected(f.id)}
                        onChange={() => toggleSelectOne(f.id)}
                        title={`Seleccionar ${f.name}`}
                      />
                    </td>

                    {/* Archivo: ícono de tipo + nombre */}
                    <td className="px-4 py-3 max-w-[240px]">
                      {(() => {
                        const ext = (f.fileType || (f.name ? f.name.split('.').pop() : '') || '').toLowerCase();
                        const FILE_BG: Record<string,string> = { csv:'#16a34a', xlsx:'#15803d', xls:'#15803d', txt:'#334155', pdf:'#b91c1c', ods:'#b45309', zip:'#6d28d9' };
                        const bg = FILE_BG[ext] || '#3730a3';
                        return (
                        <button
                        onClick={() => {
                          setSelectedThreadId(null);
                          setSelected(f.id);
                          setDetailOpen(true);
                        }}
                        className="group flex items-center gap-3 text-left w-full focus:outline-none"
                        title="Ver detalle y trazabilidad"
                        aria-label={`Ver detalle de ${f.name}`}
                      >
                        <div style={{ width:36, height:36, borderRadius:8, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <span style={{ fontSize:9, fontWeight:800, color:'#fff', letterSpacing:'0.05em' }}>{ext.toUpperCase().slice(0,4)||'FILE'}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-neutral-200 truncate group-hover:text-white transition-colors">{f.name}</div>
                          {f.note && <div className="text-[11px] text-neutral-500 truncate">{f.note}</div>}
                        </div>
                      </button>
                        );
                      })()}
                    </td>

                    {/* Usuario que subió */}
                    <td className="px-4 py-3">
                      {(() => {
                        const uploader = userById[f.byUserId] || null;
                        const name = uploader?.displayName || uploader?.username || f.byUsername || '—';
                        const role = uploader?.role || '';
                        return (
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Avatar
                              src={uploader?.avatarDataUrl || undefined}
                              name={name}
                              size={24}
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-neutral-200 truncate">{name}</div>
                              {role && <div className="text-[10px] text-neutral-500 capitalize">{role === 'rrhh' ? 'RRHH' : role === 'sueldos' ? 'Sueldos' : role}</div>}
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    <td className="px-4 py-3">
                      {(() => {
                        const ext = (f.fileType || (f.name ? f.name.split('.').pop() : '') || '').toLowerCase();
                        const known = ['csv','xlsx','xls','txt','pdf','ods','zip'].includes(ext);
                        return <span className={`df-badge df-file-${known ? ext : 'default'}`}>{ext.toUpperCase() || 'FILE'}</span>;
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-neutral-800 text-xs">
                          v{f.version}
                        </span>
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={cls(
                          "px-2 py-0.5 rounded-lg text-xs whitespace-nowrap",
                          statusBadgeClasses(effectiveStatus(f))
                        )}
                      >
                        {displayStatusForRole(effectiveStatus(f), f)}
                      </span>
                    </td>

                    {/* Dudas/Arreglos */}
                    <td className="px-4 py-3">
                      {(() => {
                        const pd = pendingDudasCount(f);
                        const ad = answeredDudasCount(f);
                        const pa = pendingArreglosCount(f);
                        const aa = answeredArreglosCount(f);
                        const totalDudas    = pd + ad;
                        const totalArreglos = pa + aa;
                        const dudasOk    = pd === 0 && totalDudas > 0;
                        const arreglosOk = pa === 0 && totalArreglos > 0;

                        if (totalDudas === 0 && totalArreglos === 0) {
                          return <span className="text-neutral-600 text-[11px]">—</span>;
                        }
                        return (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {pd > 0 && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                title={`${pd} duda(s) sin responder`}
                              >
                                ⚠ {pd} duda{pd > 1 ? "s" : ""}
                              </span>
                            )}
                            {dudasOk && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                title={`${ad} duda(s) procesada(s)`}
                              >
                                ✓ {ad} duda{ad > 1 ? "s" : ""}
                              </span>
                            )}
                            {pa > 0 && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/20 text-sky-300 border border-sky-500/40"
                                title={`${pa} arreglo(s) sin procesar`}
                              >
                                🔧 {pa} arreglo{pa > 1 ? "s" : ""}
                              </span>
                            )}
                            {arreglosOk && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                title={`${aa} arreglo(s) procesado(s)`}
                              >
                                ✓ {aa} arreglo{aa > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    <td className="px-4 py-3 text-neutral-400">
                      {formatDate(f.at)}
                    </td>

                    {/* Acciones -> tres puntos */}
                    <td className="px-2 py-3">
                      <div className="relative inline-block">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const el = e.currentTarget as HTMLElement | null;
                          const rect = el ? el.getBoundingClientRect() : null;
                          setRowMenuOpen((prev) => {
                            const next = prev === f.id ? null : f.id;
                            if (next) {
                              if (rect) setRowMenuAnchor(rect);
                              else if (!rowMenuAnchor) setRowMenuAnchor(new DOMRect(8, 8, 0, 0));
                            } else {
                              setRowMenuAnchor(null);
                            }
                            return next;
                          });
                        }}
                        className="df-row-menu-btn"
                        title="Acciones"
                      >
                        ⋮
                      </button>

                        {rowMenuOpen === f.id && rowMenuAnchor && (
  <RowMenuPortal
    anchorRect={rowMenuAnchor}
    onClose={() => {
      setRowMenuOpen(null);
      setRowMenuAnchor(null);
    }}
    width={256}
  >
    {myPerms.actions.bumpVersion && (
      <button
        onClick={() => {
          setRowMenuOpen(null);
          setRowMenuAnchor(null);
          bumpVersion(f.id);
        }}
        className={MENU_ITEM}
      >
        ➕ Nueva versión
      </button>
    )}
    {myPerms.actions.download && (
      <button
        onClick={() => {
          setRowMenuOpen(null);
          setRowMenuAnchor(null);
          doDownload(f.id);
        }}
        className={MENU_ITEM}
      >
        ⬇️ Descargar
      </button>
    )}
    {myPerms.actions.markDownloaded && (
      <button
        onClick={() => {
          setRowMenuOpen(null);
          setRowMenuAnchor(null);
          markDownloaded(f.id);
        }}
        className={MENU_ITEM}
      >
        ✅ Marcar descargado
      </button>
    )}

    {(meRole === "rrhh" || meRole === "admin") && (
      <>
        <div className="px-2 pt-2 pb-1 text-[11px] uppercase tracking-wide text-neutral-500">
          Arreglos
        </div>
        <button
          onClick={() => {
            setRowMenuOpen(null);
            setRowMenuAnchor(null);
            openAdjustForFile(f);
          }}
          className={MENU_ITEM}
          title="Solicitar arreglos de información para este archivo"
        >
          🛠️ Arreglos (RRHH)
        </button>
      </>
    )}

    {(meRole === "sueldos" || meRole === "admin") && (
      <>
        <div className="px-2 pt-2 pb-1 text-[11px] uppercase tracking-wide text-neutral-500">
          Dudas
        </div>
        <button
          onClick={() => {
            setRowMenuOpen(null);
            setRowMenuAnchor(null);
            setObserveDialog({
              open: true,
              fileId: f.id,
              rows: [blankObsRow()],
            });
          }}
          className={MENU_ITEM}
          title="Cargar dudas por funcionario"
        >
          🧾 Dudas por funcionario
        </button>
        <button
          onClick={() => {
            setRowMenuOpen(null);
            setRowMenuAnchor(null);
            openFileDoubt(f);
          }}
          className={MENU_ITEM}
          title="Duda general del archivo"
        >
          ❓ Duda del archivo
        </button>
      </>
    )}

    {(meRole === "admin" || meRole === "superadmin") && (
      <>
        <div className="px-2 pt-2 pb-1 text-[11px] uppercase tracking-wide text-neutral-500">
          Administración
        </div>
        <button
          onClick={() => {
            setRowMenuOpen(null);
            setRowMenuAnchor(null);
            deleteFile(f.id);
          }}
          className={cls(MENU_ITEM, "text-rose-300")}
          title={isSuperAdmin ? "Eliminar permanentemente (sin trazabilidad)" : "Anular archivo (queda en trazabilidad)"}
        >
          {isSuperAdmin ? "💀 Eliminar permanentemente" : "🗑️ Anular"}
        </button>
      </>
    )}
  </RowMenuPortal>
)}

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </section>
  );
}
