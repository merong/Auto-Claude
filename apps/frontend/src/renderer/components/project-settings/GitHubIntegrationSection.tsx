import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Github, RefreshCw, KeyRound, Info } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { StatusBadge } from './StatusBadge';
import { PasswordInput } from './PasswordInput';
import { ConnectionStatus } from './ConnectionStatus';
import { GitHubOAuthFlow } from './GitHubOAuthFlow';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import type { ProjectEnvConfig, GitHubSyncStatus } from '../../../shared/types';

interface GitHubIntegrationSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
  envConfig: ProjectEnvConfig;
  onUpdateConfig: (updates: Partial<ProjectEnvConfig>) => void;
  gitHubConnectionStatus: GitHubSyncStatus | null;
  isCheckingGitHub: boolean;
  projectName?: string;
}

export function GitHubIntegrationSection({
  isExpanded,
  onToggle,
  envConfig,
  onUpdateConfig,
  gitHubConnectionStatus,
  isCheckingGitHub,
  projectName,
}: GitHubIntegrationSectionProps) {
  const { t } = useTranslation('settings');
  const [showOAuthFlow, setShowOAuthFlow] = useState(false);

  const badge = envConfig.githubEnabled ? (
    <StatusBadge status="success" label={t('linear.enabled')} />
  ) : null;

  const handleOAuthSuccess = (token: string, _username?: string) => {
    onUpdateConfig({ githubToken: token });
    setShowOAuthFlow(false);
  };

  return (
    <CollapsibleSection
      title={t('github.integration')}
      icon={<Github className="h-4 w-4" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      badge={badge}
    >
      {/* Project-Specific Configuration Notice */}
      {projectName && (
        <div className="rounded-lg border border-info/30 bg-info/5 p-3 mb-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-info mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{t('github.projectSpecificConfig')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                <Trans
                  i18nKey="github.projectSpecificDescription"
                  t={t}
                  values={{ projectName }}
                  components={{ strong: <span className="font-semibold text-foreground" /> }}
                />
                {' '}{t('github.projectSpecificOwnRepo')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="font-normal text-foreground">{t('github.enableIssues')}</Label>
          <p className="text-xs text-muted-foreground">
            {t('github.enableIssuesDescription')}
          </p>
        </div>
        <Switch
          checked={envConfig.githubEnabled}
          onCheckedChange={(checked) => onUpdateConfig({ githubEnabled: checked })}
        />
      </div>

      {envConfig.githubEnabled && (
        <>
          {showOAuthFlow ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">{t('github.authentication')}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOAuthFlow(false)}
                >
                  {t('github.useManualToken')}
                </Button>
              </div>
              <GitHubOAuthFlow
                onSuccess={handleOAuthSuccess}
                onCancel={() => setShowOAuthFlow(false)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">{t('github.personalAccessToken')}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOAuthFlow(true)}
                  className="gap-2"
                >
                  <KeyRound className="h-3 w-3" />
                  {t('github.useOAuthInstead')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                <Trans
                  i18nKey="github.createTokenDescription"
                  t={t}
                  components={{ code: <code className="px-1 bg-muted rounded" /> }}
                />{' '}
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=Auto-Build-UI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-info hover:underline"
                >
                  {t('github.githubSettings')}
                </a>
              </p>
              <PasswordInput
                value={envConfig.githubToken || ''}
                onChange={(value) => onUpdateConfig({ githubToken: value })}
                placeholder="ghp_xxxxxxxx or github_pat_xxxxxxxx"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">{t('github.repository')}</Label>
            <p className="text-xs text-muted-foreground">
              <Trans
                i18nKey="github.repositoryFormat"
                t={t}
                components={{ code: <code className="px-1 bg-muted rounded" /> }}
              />
            </p>
            <Input
              placeholder={t('github.repositoryPlaceholder')}
              value={envConfig.githubRepo || ''}
              onChange={(e) => onUpdateConfig({ githubRepo: e.target.value })}
            />
          </div>

          {/* Connection Status */}
          {envConfig.githubToken && envConfig.githubRepo && (
            <ConnectionStatus
              isChecking={isCheckingGitHub}
              isConnected={gitHubConnectionStatus?.connected || false}
              title={t('github.connectionStatus')}
              successMessage={t('github.connectedTo', { repoFullName: gitHubConnectionStatus?.repoFullName })}
              errorMessage={gitHubConnectionStatus?.error || t('github.notConnected')}
              additionalInfo={gitHubConnectionStatus?.repoDescription}
            />
          )}

          {/* Info about accessing issues */}
          {gitHubConnectionStatus?.connected && (
            <div className="rounded-lg border border-info/30 bg-info/5 p-3">
              <div className="flex items-start gap-3">
                <Github className="h-5 w-5 text-info mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{t('github.issuesAvailable')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('github.issuesAvailableDescription')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Auto-sync Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-info" />
                <Label className="font-normal text-foreground">{t('github.autoSyncOnLoad')}</Label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                {t('github.autoSyncDescription')}
              </p>
            </div>
            <Switch
              checked={envConfig.githubAutoSync || false}
              onCheckedChange={(checked) => onUpdateConfig({ githubAutoSync: checked })}
            />
          </div>
        </>
      )}
    </CollapsibleSection>
  );
}
