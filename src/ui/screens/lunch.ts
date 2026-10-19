import { sfx } from '../../audio/sfx';
import { t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { canEat, canUpgrade, eatDish, finishLunch, LUNCH_DISHES, type LunchDish, restHeal, type RunState } from '../../game/run';
import type { Screen } from '../app';
import { icon } from '../art/icons';
import { CARD_SHOW_MS, playCardChange } from '../components/cardShow';
import { openDeck } from '../components/modals';
import { closeRoom, roomOption, roomScene } from '../components/room';
import { h } from '../dom';
import { playHealing, HEAL_ANIM_MS } from './rest';
import { runHud } from './journey';

const DISH_ICON: Record<LunchDish, string> = { lasagna: 'lasagna', tiramisu: 'tiramisu', recipe: 'recipe' };

/**
 * Sunday Lunch (the weekend's own room): three dishes on the table and room for `CONFIG.lunch.dishes` of them. The lasagna heals like a nap, the tiramisu adds max HP,
 * grandma's recipe upgrades a card. Nothing is saved until the room ends, like the other rooms.
 */
export function lunchScreen(run: RunState, onDone: () => void): Screen {
  const eaten = new Set<LunchDish>();
  const buttons = new Map<LunchDish, HTMLButtonElement>();
  const hint = h('p', { class: 'sub lunch-left' });

  const descOf = (dish: LunchDish): string => {
    switch (dish) {
      case 'lasagna':
        return restHeal(run) > 0 ? t('lunch.lasagnaDesc', { n: restHeal(run) }) : t('rest.full');
      case 'tiramisu':
        return t('lunch.tiramisuDesc', { n: CONFIG.lunch.maxHp });
      case 'recipe':
        return run.deck.some(canUpgrade) ? t('lunch.recipeDesc') : t('lunch.recipeNone');
    }
  };

  /** A dish is down: the room closes after the last one (or when nothing else on the table would change anything). */
  const ate = (dish: LunchDish, ms: number): void => {
    eaten.add(dish);
    const left = CONFIG.lunch.dishes - eaten.size;
    const more = LUNCH_DISHES.some((d) => !eaten.has(d) && canEat(run, d));
    refresh();
    if (left <= 0 || !more) {
      finishLunch(run);
      closeRoom(el, onDone, ms);
    }
  };

  function refresh(): void {
    for (const [dish, button] of buttons) button.disabled = eaten.has(dish) || !canEat(run, dish);
    hint.textContent = t('lunch.left', { n: CONFIG.lunch.dishes - eaten.size });
  }

  const dishes: Record<LunchDish, () => void> = {
    lasagna: () => {
      playHealing(el, eatDish(run, 'lasagna'));
      ate('lasagna', HEAL_ANIM_MS);
    },
    tiramisu: () => {
      playHealing(el, eatDish(run, 'tiramisu'), t('reward.maxHp'), false, 'tiramisu');
      ate('tiramisu', HEAL_ANIM_MS);
    },
    recipe: () => {
      sfx('tap');
      openDeck(run.deck, {
        title: t('rest.smithHint'),
        confirmLabel: t('rest.upgrade'),
        filter: canUpgrade,
        previewSelected: (c) => ({ ...c, up: true }),
        onPick: (c) => {
          const before = { ...c };
          eatDish(run, 'recipe', c.uid);
          playCardChange(el, before, { ...c }, t('rest.upgraded'), { start: 'anvil', end: 'levelUp' });
          ate('recipe', CARD_SHOW_MS);
        },
      });
    },
  };

  const options = h('div', { class: 'rest-options lunch-options' });
  for (const dish of LUNCH_DISHES) {
    const button = roomOption(icon(DISH_ICON[dish]), t(`lunch.${dish}`), descOf(dish), !canEat(run, dish), dishes[dish]);
    buttons.set(dish, button);
    options.append(button);
  }
  refresh();

  const leave = h(
    'button',
    {
      class: 'secondary',
      onclick: () => {
        finishLunch(run);
        closeRoom(el, onDone, 200);
      },
    },
    t('lunch.leave'),
  );

  const el = h(
    'div',
    { class: 'screen' },
    runHud(run),
    h('h1', { class: 'h1', style: { marginTop: '12px' } }, t('lunch.title')),
    h('p', { class: 'sub' }, t('lunch.desc')),
    roomScene('lunch'),
    options,
    hint,
    leave,
  );
  return { el };
}
