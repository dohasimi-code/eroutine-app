import { useApp } from '../../lib/AppContext';
import { BodyText, Card, Screen } from '../../ui/Screen';

export default function MenuScreen() {
  const { t } = useApp();
  return (
    <Screen title={t('menu.title')}>
      <Card>
        <BodyText muted>{t('menu.placeholder')}</BodyText>
      </Card>
    </Screen>
  );
}
