import React from 'react';
import { useInvitationState } from '../../hooks/useInvitationState';

export function DesignElement({ id, children, defaultColor }) {
  const { data } = useInvitationState();
  const saved = data.positions?.[id];
  const hasCustomPlacement = saved?.x != null && saved?.y != null;

  const style = {
    color: saved?.color || defaultColor || 'inherit',
    transform: `scale(${saved?.scale ?? 1})`,
    transformOrigin: 'top left',
    display: 'inline-block',
    ...(hasCustomPlacement ? { position: 'absolute', left: saved.x, top: saved.y, zIndex: 30 } : {}),
  };

  return <span style={style}>{children}</span>;
}
