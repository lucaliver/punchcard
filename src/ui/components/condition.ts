import { t } from '../../core/i18n';
import { type ConditionDef, conditionAmount } from '../../data/conditions';
import { keywordHtml } from './cardView';

/** What a condition says about itself, for the screens that tell it: its name, what it does (keywords marked up) and, when it changes the pay, by how much. */
export function conditionText(c: ConditionDef): { name: string; desc: string; pay?: string } {
  return {
    name: t(`condition.${c.id}.name`),
    desc: keywordHtml(t(`condition.${c.id}.d`, { n: conditionAmount(c) })),
    pay: c.pay === 1 ? undefined : t('condition.pay', { n: Math.round((c.pay - 1) * 100) }),
  };
}
