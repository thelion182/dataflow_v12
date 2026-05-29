// @ts-nocheck
import React from "react";
import { cls } from "../../lib/cls";
import { formatDate } from "../../lib/time";
import { statusBadgeClasses, Th } from "../shared/uiHelpers";
import {
  pendingDudasCount, answeredDudasCount,
  pendingArreglosCount, answeredArreglosCount,
} from "../observations/observationHelpers";
import { RowMenuPortal } from "./RowMenuPortal";
import Avatar from "../../components/Avatar";

// ── Iconos SVG de archivo tipo documento ────────────────────
function FileDocIcon({ ext }: { ext: string }) {
  const e = (ext || '').toLowerCase();

  // Colores por tipo
  const colors: Record<string, { bg: string; accent: string; badge: string }> = {
    csv:  { bg: '#0d2a16', accent: '#22c55e', badge: '#16a34a' },
    xlsx: { bg: '#0d2518', accent: '#4ade80', badge: '#15803d' },
    xls:  { bg: '#0d2518', accent: '#4ade80', badge: '#15803d' },
    ods:  { bg: '#1a2200', accent: '#a3e635', badge: '#65a30d' },
    txt:  { bg: '#0d1a30', accent: '#60a5fa', badge: '#2563eb' },
    pdf:  { bg: '#2a0d0d', accent: '#f87171', badge: '#dc2626' },
    zip:  { bg: '#1a0d2a', accent: '#c084fc', badge: '#9333ea' },
  };
  const c = colors[e] || { bg: '#0d1530', accent: '#818cf8', badge: '#4f46e5' };
  const label = e.toUpperCase().slice(0, 4) || 'FILE';

  // Gráficos internos por tipo
  const internals: Record<string, React.ReactNode> = {
    csv: (
      <g stroke={c.accent} strokeWidth="1.2" strokeLinecap="round">
        <line x1="8" y1="14" x2="20" y2="14"/>
        <line x1="8" y1="18" x2="20" y2="18"/>
        <line x1="8" y1="22" x2="20" y2="22"/>
        <line x1="14" y1="12" x2="14" y2="24"/>
      </g>
    ),
    xlsx: (
      <g stroke={c.accent} strokeWidth="2" strokeLinecap="round">
        <line x1="9" y1="13" x2="19" y2="23"/>
        <line x1="19" y1="13" x2="9" y2="23"/>
      </g>
    ),
    xls: (
      <g stroke={c.accent} strokeWidth="2" strokeLinecap="round">
        <line x1="9" y1="13" x2="19" y2="23"/>
        <line x1="19" y1="13" x2="9" y2="23"/>
      </g>
    ),
    ods: (
      <g stroke={c.accent} strokeWidth="1.2" strokeLinecap="round">
        <rect x="8" y="13" width="12" height="10" rx="0.5" fill="none"/>
        <line x1="8" y1="18" x2="20" y2="18"/>
        <line x1="14" y1="13" x2="14" y2="23"/>
      </g>
    ),
    txt: (
      <g stroke={c.accent} strokeWidth="1.4" strokeLinecap="round">
        <line x1="8" y1="14" x2="20" y2="14"/>
        <line x1="8" y1="18" x2="17" y2="18"/>
        <line x1="8" y1="22" x2="20" y2="22"/>
      </g>
    ),
    pdf: (
      <text x="14" y="22" textAnchor="middle" fill={c.accent} fontSize="8" fontWeight="800" fontFamily="monospace">PDF</text>
    ),
    zip: (
      <g stroke={c.accent} strokeWidth="1.4" strokeLinecap="round">
        <line x1="14" y1="12" x2="14" y2="24"/>
        <path d="M11 15h6M11 18h6M11 21h6"/>
      </g>
    ),
  };
  const graphic = internals[e] || (
    <text x="14" y="22" textAnchor="middle" fill={c.accent} fontSize="7" fontWeight="700" fontFamily="monospace">{label}</text>
  );

  return (
    <svg width="28" height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      {/* Sombra/glow sutil */}
      <defs>
        <filter id={`glow-${e}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      {/* Cuerpo del documento */}
      <path d="M4,0 H20 L28,8 V30 Q28,34 24,34 H4 Q0,34 0,30 V4 Q0,0 4,0 Z"
        fill={c.bg} stroke={c.accent} strokeWidth="0.8" strokeOpacity="0.6"/>
      {/* Esquina doblada */}
      <path d="M20,0 L28,8 H22 Q20,8 20,6 Z" fill={c.accent} fillOpacity="0.25" stroke={c.accent} strokeWidth="0.6" strokeOpacity="0.5"/>
      {/* Badge inferior con color */}
      <rect x="0" y="26" width="28" height="8" rx="0" fill={c.badge} fillOpacity="0.9"/>
      <path d="M0,26 H28 V30 Q28,34 24,34 H4 Q0,34 0,30 Z" fill={c.badge}/>
      {/* Label del tipo */}
      <text x="14" y="32" textAnchor="middle" fill="white" fontSize="6" fontWeight="800"
        fontFamily="'SF Mono','Fira Code',monospace" letterSpacing="0.04em">{label}</text>
      {/* Gráfico interno */}
      {graphic}
    </svg>
  );
}

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
  filePage, setFilePage, totalPages, totalFiles,
  tablePageSize, updateTablePageSize, tableExpanded, setTableExpanded,
}: any) {
  const userById = React.useMemo(() => {
    const m = {};
    (usersSnap || []).forEach(u => { m[u.id] = u; });
    return m;
  }, [usersSnap]);

  return (
    <section className="rounded-2xl border border-neutral-800 overflow-visible">
      <div className="px-4 py-2 flex items-center justify-between text-xs text-neutral-400 bg-neutral-900/50 border-b border-neutral-800 rounded-t-2xl">
        <span>
          Archivos de:{" "}
          <span className="text-neutral-200 font-medium">
            {periodNameById[selectedPeriodId] || "—"}
          </span>
        </span>
        {totalFiles > 0 && (
          <span className="text-neutral-500">
            {totalFiles} archivo{totalFiles !== 1 ? 's' : ''}
          </span>
        )}
      </div>

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
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected(f.id)}
                      onChange={() => toggleSelectOne(f.id)}
                      title={`Seleccionar ${f.name}`}
                    />
                  </td>

                  {/* Archivo: ícono SVG + nombre */}
                  <td className="px-4 py-2 max-w-[240px]">
                    {(() => {
                      const ext = (f.fileType || (f.name ? f.name.split('.').pop() : '') || '').toLowerCase();
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
                          <FileDocIcon ext={ext} />
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-neutral-200 truncate group-hover:text-white transition-colors">{f.name}</div>
                            {f.note && <div className="text-[11px] text-neutral-500 truncate">{f.note}</div>}
                          </div>
                        </button>
                      );
                    })()}
                  </td>

                  {/* Usuario */}
                  <td className="px-4 py-3">
                    {(() => {
                      const uploader = userById[f.byUserId] || null;
                      const name = uploader?.displayName || uploader?.username || f.byUsername || '—';
                      const role = uploader?.role || '';
                      return (
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Avatar src={uploader?.avatarDataUrl || undefined} name={name} size={32} />
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
                    <span className={cls("px-2 py-0.5 rounded-lg text-xs whitespace-nowrap", statusBadgeClasses(effectiveStatus(f)))}>
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
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40" title={`${pd} duda(s) sin responder`}>
                              ⚠ {pd} duda{pd > 1 ? "s" : ""}
                            </span>
                          )}
                          {dudasOk && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" title={`${ad} duda(s) procesada(s)`}>
                              ✓ {ad} duda{ad > 1 ? "s" : ""}
                            </span>
                          )}
                          {pa > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/20 text-sky-300 border border-sky-500/40" title={`${pa} arreglo(s) sin procesar`}>
                              🔧 {pa} arreglo{pa > 1 ? "s" : ""}
                            </span>
                          )}
                          {arreglosOk && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" title={`${aa} arreglo(s) procesado(s)`}>
                              ✓ {aa} arreglo{aa > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>

                  <td className="px-4 py-3 text-neutral-400">{formatDate(f.at)}</td>

                  {/* Acciones */}
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
                      >⋮</button>

                      {rowMenuOpen === f.id && rowMenuAnchor && (
                        <RowMenuPortal anchorRect={rowMenuAnchor} onClose={() => { setRowMenuOpen(null); setRowMenuAnchor(null); }} width={256}>
                          {myPerms.actions.bumpVersion && (
                            <button onClick={() => { setRowMenuOpen(null); setRowMenuAnchor(null); bumpVersion(f.id); }} className={MENU_ITEM}>
                              ➕ Nueva versión
                            </button>
                          )}
                          {myPerms.actions.download && (
                            <button onClick={() => { setRowMenuOpen(null); setRowMenuAnchor(null); doDownload(f.id); }} className={MENU_ITEM}>
                              ⬇️ Descargar
                            </button>
                          )}
                          {myPerms.actions.markDownloaded && (
                            <button onClick={() => { setRowMenuOpen(null); setRowMenuAnchor(null); markDownloaded(f.id); }} className={MENU_ITEM}>
                              ✅ Marcar descargado
                            </button>
                          )}
                          {(meRole === "rrhh" || meRole === "admin") && (
                            <>
                              <div className="px-2 pt-2 pb-1 text-[11px] uppercase tracking-wide text-neutral-500">Arreglos</div>
                              <button onClick={() => { setRowMenuOpen(null); setRowMenuAnchor(null); openAdjustForFile(f); }} className={MENU_ITEM} title="Solicitar arreglos de información para este archivo">
                                🛠️ Arreglos (RRHH)
                              </button>
                            </>
                          )}
                          {(meRole === "sueldos" || meRole === "admin") && (
                            <>
                              <div className="px-2 pt-2 pb-1 text-[11px] uppercase tracking-wide text-neutral-500">Dudas</div>
                              <button onClick={() => { setRowMenuOpen(null); setRowMenuAnchor(null); setObserveDialog({ open: true, fileId: f.id, rows: [blankObsRow()] }); }} className={MENU_ITEM} title="Cargar dudas por funcionario">
                                🧾 Dudas por funcionario
                              </button>
                              <button onClick={() => { setRowMenuOpen(null); setRowMenuAnchor(null); openFileDoubt(f); }} className={MENU_ITEM} title="Duda general del archivo">
                                ❓ Duda del archivo
                              </button>
                            </>
                          )}
                          {(meRole === "admin" || meRole === "superadmin") && (
                            <>
                              <div className="px-2 pt-2 pb-1 text-[11px] uppercase tracking-wide text-neutral-500">Administración</div>
                              <button onClick={() => { setRowMenuOpen(null); setRowMenuAnchor(null); deleteFile(f.id); }} className={cls(MENU_ITEM, "text-rose-300")} title={isSuperAdmin ? "Eliminar permanentemente (sin trazabilidad)" : "Anular archivo (queda en trazabilidad)"}>
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

      {/* Paginación + config */}
      {(totalPages > 1 || (isAdmin || isSuperAdmin)) && (
        <div className="px-4 py-3 border-t border-neutral-800 flex items-center justify-between gap-3 bg-neutral-900/30 rounded-b-2xl flex-wrap">
          <span className="text-xs text-neutral-500">
            {tableExpanded
              ? `${totalFiles} archivo${totalFiles !== 1 ? 's' : ''} · Vista completa`
              : `Página ${filePage + 1} de ${totalPages} · ${totalFiles} archivo${totalFiles !== 1 ? 's' : ''}`}
          </span>
          <div className="flex items-center gap-3">
            {(isAdmin || isSuperAdmin) && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={tableExpanded}
                    onChange={(e) => {
                      setTableExpanded(e.target.checked);
                      if (!e.target.checked) setFilePage(0);
                    }}
                    className="w-3 h-3 accent-indigo-500"
                  />
                  Ver todo
                </label>
                {!tableExpanded && (
                  <select
                    value={tablePageSize}
                    onChange={(e) => updateTablePageSize(parseInt(e.target.value, 10))}
                    className="bg-neutral-800 border border-neutral-700 rounded px-1.5 py-0.5 text-xs text-neutral-300 cursor-pointer"
                    title="Archivos por página"
                  >
                    {[3, 5, 6, 10, 20].map(n => (
                      <option key={n} value={n}>{n} / pág.</option>
                    ))}
                  </select>
                )}
              </div>
            )}
            {!tableExpanded && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilePage(p => Math.max(0, p - 1))}
                  disabled={filePage === 0}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Página anterior"
                >
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2L4 6l4 4"/>
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i).map(i => (
                  <button
                    key={i}
                    onClick={() => setFilePage(i)}
                    className={cls(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                      i === filePage
                        ? "bg-indigo-600/80 text-white"
                        : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setFilePage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={filePage >= totalPages - 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Página siguiente"
                >
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 2l4 4-4 4"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
