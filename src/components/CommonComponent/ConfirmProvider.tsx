import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

type Variant = 'danger' | 'primary' | 'warning' | 'info';

interface Options {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  icon?: React.ReactNode;
}

type ConfirmFn = (opts: Options) => Promise<boolean>;

const Ctx = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<Options | null>(null);
  const [visible, setVisible] = useState(false);
  const resolverRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((o) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOpts({ ...o, variant: o.variant ?? 'danger' });
      setVisible(true);
    });
  }, []);

  const close = useCallback((result: boolean) => {
    setVisible(false);
    setTimeout(() => {
      resolverRef.current?.(result);
      resolverRef.current = null;
      setOpts(null);
    }, 180);
  }, []);

  return (
    <Ctx.Provider value={confirm}>
      {children}
      {opts && (
        <ConfirmDialog
          visible={visible}
          title={opts.title}
          description={opts.description}
          confirmLabel={opts.confirmLabel}
          cancelLabel={opts.cancelLabel}
          variant={opts.variant}
          icon={opts.icon}
          onConfirm={() => close(true)}
          onCancel={() => close(false)}
        />
      )}
    </Ctx.Provider>
  );
}
