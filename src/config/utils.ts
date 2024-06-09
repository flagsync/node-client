import deepmerge from 'deepmerge';

import { DEFAULT_CONFIG } from '~config/constants';
import { FsConfig } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { FsServiceError, ServiceErrorCode } from '~api/error/service-error';

import { loggerFactory } from '~logger/logger-factory';

function validateSettings(settings: FsSettings): void {
  if (!settings.sdkKey) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'sdkKey is required',
    });
  }
  if (settings.tracking.impressions.pushRate < 30) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'track.impressions.pushRate must be greater than 30',
    });
  }
  if (settings.tracking.impressions.maxQueueSize < 50) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'track.impressions.maxQueueSize must be greater than 50',
    });
  }
  if (settings.tracking.events.pushRate < 30) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'track.events.pushRate must be greater than 30',
    });
  }
  if (settings.tracking.events.maxQueueSize < 50) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'track.events.maxQueueSize must be greater than 50',
    });
  }
  if (settings.sync.pollRate < 30) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'sync.pollRate must be greater than 30',
    });
  }
  /**
   * This can only be thrown by an invalid SDK configuration from the library
   * itself.
   */
  if (!settings.metadata.sdkName || !settings.metadata.sdkVersion) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message:
        'Unable to determine SDK name or version. Please contact support.',
    });
  }
}

export function buildSettingsFromConfig(config: FsConfig): FsSettings {
  const settings = deepmerge<FsSettings, FsConfig>(DEFAULT_CONFIG, config);
  settings.log = loggerFactory(settings, config.logger);

  const metadata = config.metadata ?? {};

  (settings as FsSettings).metadata = {
    ...metadata,
    ...{
      sdkName: '__SDK_NAME__',
      sdkVersion: '__SDK_VERSION__',
    },
  };

  validateSettings(settings);

  settings.sdkContext = {
    sdkName: settings.metadata.sdkName,
    sdkVersion: settings.metadata.sdkVersion,
  };

  settings.platform = 'node';

  return settings;
}
