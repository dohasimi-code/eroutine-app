import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { INGREDIENTS } from '../../data/ingredients';
import { useApp } from '../../lib/AppContext';
import { formatQuantity } from '../../lib/quantity';
import {
  CATEGORY_ORDER,
  buildShoppingList,
  estimateCost,
  formatDate,
  formatLek,
  itemKey,
  parseLek,
  priceUnitFor,
  todayIso,
  type ListItem,
  type PriceUnit,
} from '../../lib/shopping';
import { Button } from '../../ui/Choice';
import { BodyText, Card, Screen } from '../../ui/Screen';
import { colors, fontSize, spacing } from '../../ui/theme';

type PriceTarget = { item: ListItem; per: PriceUnit };

export default function ShoppingListScreen() {
  const { t, language, week, profile, prices, listState, toggleAtHome, toggleBought } = useApp();
  const [editing, setEditing] = useState<PriceTarget | null>(null);

  const items = useMemo(() => (week && profile ? buildShoppingList(week, profile.people) : []), [week, profile]);
  const atHome = useMemo(() => new Set(listState.atHome), [listState.atHome]);
  const bought = useMemo(() => new Set(listState.bought), [listState.bought]);

  if (!week || !profile || items.length === 0) {
    return (
      <Screen title={t('list.title')}>
        <Card>
          <BodyText muted>{t('list.empty')}</BodyText>
        </Card>
      </Screen>
    );
  }

  const toBuy = items.filter((item) => !item.staple && !atHome.has(itemKey(item)));
  const staples = items.filter((item) => item.staple && !atHome.has(itemKey(item)));
  const home = items.filter((item) => atHome.has(itemKey(item)));
  const estimate = estimateCost(items, prices, atHome);

  const row = (item: ListItem) => (
    <ItemRow
      key={itemKey(item)}
      item={item}
      bought={bought.has(itemKey(item))}
      onToggleBought={() => toggleBought(itemKey(item))}
      onAtHome={() => toggleAtHome(itemKey(item))}
      onEditPrice={(per) => setEditing({ item, per })}
    />
  );

  return (
    <Screen title={t('list.title')} subtitle={t('list.subtitle', { n: profile.people })}>
      <Card>
        <Text style={styles.heading}>{t('list.estimate')}</Text>
        {estimate.priced > 0 ? (
          <>
            <Text style={styles.estimate}>{t('list.estimate.value', { lek: formatLek(estimate.lek, language) })}</Text>
            <BodyText muted>{t('list.estimate.partial', { priced: estimate.priced, total: estimate.total })}</BodyText>
          </>
        ) : (
          <BodyText muted>{t('list.estimate.none')}</BodyText>
        )}
        <BodyText muted>{t('list.estimate.hint')}</BodyText>
      </Card>

      {CATEGORY_ORDER.map((category) => {
        const inCategory = toBuy.filter((item) => INGREDIENTS[item.id].category === category);
        if (inCategory.length === 0) return null;
        return (
          <Card key={category}>
            <Text style={styles.heading}>{t(`list.category.${category}`)}</Text>
            {inCategory.map(row)}
          </Card>
        );
      })}

      {staples.length > 0 ? (
        <Card>
          <Text style={styles.heading}>{t('list.staples')}</Text>
          <BodyText muted>{t('list.staples.hint')}</BodyText>
          {staples.map(row)}
        </Card>
      ) : null}

      {home.length > 0 ? (
        <Card>
          <Text style={styles.heading}>{t('list.atHome.section')}</Text>
          {home.map((item) => (
            <View key={itemKey(item)} style={styles.row}>
              <Text style={[styles.name, styles.muted]}>{INGREDIENTS[item.id].name[language]}</Text>
              <Pressable onPress={() => toggleAtHome(itemKey(item))} accessibilityRole="button" hitSlop={8}>
                <Text style={styles.link}>{t('list.atHome.undo')}</Text>
              </Pressable>
            </View>
          ))}
        </Card>
      ) : null}

      <BodyText muted>{t('list.labels')}</BodyText>

      <PriceSheet target={editing} onClose={() => setEditing(null)} />
    </Screen>
  );
}

type ItemRowProps = {
  item: ListItem;
  bought: boolean;
  onToggleBought(): void;
  onAtHome(): void;
  onEditPrice(per: PriceUnit): void;
};

function ItemRow({ item, bought, onToggleBought, onAtHome, onEditPrice }: ItemRowProps) {
  const { t, language, prices } = useApp();
  const info = INGREDIENTS[item.id];
  const per = priceUnitFor(item.unit);
  const price = prices[item.id];
  const name = info.name[language];

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggleBought}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: bought }}
        accessibilityLabel={name}
        hitSlop={8}
        style={styles.check}
      >
        <Ionicons name={bought ? 'checkbox' : 'square-outline'} size={24} color={bought ? colors.primary : colors.textMuted} />
      </Pressable>
      <View style={styles.main}>
        <Text style={[styles.name, bought && styles.done]}>
          {name}
          {item.optional ? <Text style={styles.note}>{` (${t('list.optional')})`}</Text> : null}
        </Text>
        <Text style={styles.detail}>{formatQuantity(item.quantity, item.unit, language)}</Text>
        {per && !item.staple ? (
          <Pressable onPress={() => onEditPrice(per)} accessibilityRole="button" hitSlop={4}>
            {price && price.per === per ? (
              <Text style={styles.detail}>
                {t(`list.price.per.${per}`, { lek: formatLek(price.lek, language) })}
                {price.store ? ` · ${price.store}` : ''} · {formatDate(price.date, language)}
              </Text>
            ) : (
              <Text style={styles.link}>{t('list.addPrice')}</Text>
            )}
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={onAtHome} accessibilityRole="button" accessibilityLabel={t('list.atHome')} hitSlop={8} style={styles.check}>
        <Ionicons name="home-outline" size={22} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

function PriceSheet({ target, onClose }: { target: PriceTarget | null; onClose(): void }) {
  const { t, language, prices, setPrice } = useApp();
  const [amount, setAmount] = useState('');
  const [shop, setShop] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [openFor, setOpenFor] = useState<PriceTarget | null>(null);

  // Fill the fields each time the sheet opens for an item.
  if (target !== openFor) {
    setOpenFor(target);
    if (target) {
      const existing = prices[target.item.id];
      const same = existing && existing.per === target.per ? existing : undefined;
      setAmount(same ? String(same.lek) : '');
      setShop(same?.store ?? '');
      setInvalid(false);
    }
  }

  if (!target) return null;
  const { item, per } = target;
  const hasPrice = prices[item.id]?.per === per;

  async function save() {
    const lek = parseLek(amount);
    if (lek === null) {
      setInvalid(true);
      return;
    }
    const store = shop.trim();
    await setPrice(item.id, { lek, per, date: todayIso(), ...(store ? { store } : {}) });
    onClose();
  }

  async function remove() {
    await setPrice(item.id, null);
    onClose();
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>{t('list.price.title', { name: INGREDIENTS[item.id].name[language] })}</Text>
          <Text style={styles.label}>{t(`list.price.amount.${per}`)}</Text>
          <TextInput
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              setInvalid(false);
            }}
            keyboardType="decimal-pad"
            autoFocus
            style={styles.input}
            accessibilityLabel={t(`list.price.amount.${per}`)}
          />
          {invalid ? <Text style={styles.warning}>{t('list.price.invalid')}</Text> : null}
          <Text style={styles.label}>{t('list.price.store')}</Text>
          <TextInput value={shop} onChangeText={setShop} maxLength={40} style={styles.input} accessibilityLabel={t('list.price.store')} />
          <BodyText muted>{t('list.price.date', { date: formatDate(todayIso(), language) })}</BodyText>
          <BodyText muted>{t('list.price.private')}</BodyText>
          <View style={styles.buttons}>
            <Button variant="quiet" label={t('list.price.cancel')} onPress={onClose} />
            <Button label={t('list.price.save')} onPress={save} />
          </View>
          {hasPrice ? <Button variant="quiet" label={t('list.price.remove')} onPress={remove} /> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text },
  estimate: { fontSize: fontSize.title, fontWeight: '600', color: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  check: { padding: spacing.xs },
  main: { flex: 1, gap: 2 },
  name: { flex: 1, fontSize: fontSize.body, color: colors.text, fontWeight: '500' },
  done: { textDecorationLine: 'line-through', color: colors.textMuted },
  muted: { color: colors.textMuted },
  note: { fontSize: fontSize.small, color: colors.textMuted, fontWeight: '400' },
  detail: { fontSize: fontSize.small, color: colors.textMuted },
  link: { fontSize: fontSize.small, color: colors.primary, fontWeight: '600' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: colors.background,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: spacing.sm,
  },
  label: { fontSize: fontSize.small, color: colors.textMuted },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.body,
    color: colors.text,
  },
  warning: { fontSize: fontSize.small, color: colors.accent },
  buttons: { flexDirection: 'row', gap: spacing.sm },
});
