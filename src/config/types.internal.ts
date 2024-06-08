import { FsCore, Platform, SyncType } from '~config/types';

import { SdkUserContext } from '~api/data-contracts';

import { ILogger, LogLevel } from '~logger/types';

export interface FsSettings {
  readonly sdkKey: string;
  core: FsCore;
  readonly sync: {
    type: (typeof SyncType)[keyof typeof SyncType];
    pollRate: number;
  };
  readonly tracking: {
    impressions: {
      maxQueueSize: number;
      pushRate: number;
    };
    events: {
      maxQueueSize: number;
      pushRate: number;
    };
  };
  readonly urls: {
    sdk: string;
  };
  readonly logLevel?: LogLevel;
  log: ILogger;
  customLogger: Partial<ILogger>;
  context: SdkUserContext;
  platform: (typeof Platform)[keyof typeof Platform];
  metadata: Record<string, any>;
}
