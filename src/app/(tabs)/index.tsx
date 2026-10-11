import { greetingKey } from '../../i18n';
import { useApp } from '../../lib/AppContext';
import { BodyText, Card, Screen } from '../../ui/Screen';

export default function TodayScreen() {
  const { t } = useApp();
  return (
    <Screen title={t(greetingKey(new Date().getHours()))} subtitle={t('today.subtitle')}>
      <Card>
        <BodyText muted>{t('today.placeholder')}</BodyText>
      </Card>
    </Screen>
  );
}
