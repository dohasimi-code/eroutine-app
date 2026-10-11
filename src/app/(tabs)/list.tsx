import { useApp } from '../../lib/AppContext';
import { BodyText, Card, Screen } from '../../ui/Screen';

export default function ShoppingListScreen() {
  const { t } = useApp();
  return (
    <Screen title={t('list.title')}>
      <Card>
        <BodyText muted>{t('list.placeholder')}</BodyText>
      </Card>
    </Screen>
  );
}
