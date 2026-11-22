import { Icon } from './icons';
import { t, type Dict } from '@/lib/i18n/dictionary';

export function StorageNote({ dict, className }: { dict: Dict; className?: string }) {
  return (
    <p className={`inline-flex items-start gap-(--space-1) text-small text-text-muted ${className ?? ''}`}>
      <Icon name="info" size={14} className="mt-[3px] shrink-0" />
      <span>{t(dict, 'storage.note')}</span>
    </p>
  );
}
