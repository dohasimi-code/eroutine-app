import { useApp } from '../../lib/AppContext';
import { BodyText, Card, Screen } from '../../ui/Screen';

export default function MomentScreen() {
  const { t } = useApp();
  return (
    <Screen title={t('moment.title')}>
      <Card>
        <BodyText>{t('moment.placeholder')}</BodyText>
        <BodyText muted>{t('moment.private')}</BodyText>
      </Card>
    </Screen>
  );
}
