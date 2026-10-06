import { motion, useDragControls, useReducedMotion, type PanInfo } from 'framer-motion';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { cx } from './kit';

/* ───────────── Шторка ───────────── */

interface SheetProps {
  children: ReactNode;
  onClose: () => void;
  title?: ReactNode;
  /** Кнопки, прилипшие к низу шторки. */
  footer?: ReactNode;
  /** Шторка во весь экран (подробности цели). */
  tall?: boolean;
  closeButton?: boolean;
}

export function Sheet({ children, onClose, title, footer, tall, closeButton = true }: SheetProps) {
  const controls = useDragControls();
  const reduce = useReducedMotion();
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 650) onClose();
  };
  return (
    <div className="overlay overlay--sheet" role="dialog" aria-modal="true">
      <motion.div className="backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }} />
      <motion.div
        className={cx('sheet', tall && 'sheet--tall')}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 340, damping: 36, mass: 0.9 }}
        drag="y"
        dragListener={false}
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.04, bottom: 0.7 }}
        onDragEnd={onDragEnd}
      >
        <div className="sheet__grab" onPointerDown={(e) => controls.start(e)} style={{ touchAction: 'none' }}>
          <span className="sheet__handle" />
          {(title || closeButton) && (
            <div className="sheet__head">
              <span className="t-h2">{title}</span>
              {closeButton && (
                <motion.button type="button" className="round-btn round-btn--s" whileTap={{ scale: 0.9 }} onClick={onClose} aria-label="Закрыть">
                  <Icon name="close" size={20} />
                </motion.button>
              )}
            </div>
          )}
        </div>
        <div className="sheet__body">{children}</div>
        {footer && <div className="sheet__footer">{footer}</div>}
      </motion.div>
    </div>
  );
}

/* ───────────── Диалог ───────────── */

export function Dialog({ children, onClose, title }: { children: ReactNode; onClose: () => void; title: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="overlay overlay--dialog" role="alertdialog" aria-modal="true">
      <motion.div className="backdrop backdrop--blur" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} />
      <motion.div
        className="dialog"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 8 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      >
        <h2 className="t-h2">{title}</h2>
        {children}
      </motion.div>
    </div>
  );
}
