import { UNREADY_FLAG_VALUE } from '~config/constants';

import { SdkUserContext } from '~api/data-contracts';

import { EvalEngineService } from '~managers/flag/flag-eval-engine/eval-engine.service';
import { IFlagManager } from '~managers/flag/types';
import { IStoreManager } from '~managers/storage/types';
import { ITrackManager } from '~managers/track/types';

export function flagManager(
  evalEngine: EvalEngineService,
  storageManager: IStoreManager,
  trackManager: ITrackManager,
): IFlagManager {
  function flag<T>(
    context: SdkUserContext,
    flagKey: string,
    defaultValue?: T,
  ): T {
    if (!flagKey || typeof flagKey !== 'string') {
      return UNREADY_FLAG_VALUE as T;
    }

    const flags = storageManager.get();
    const flag = flags[flagKey];

    if (!flag) {
      return (defaultValue ?? UNREADY_FLAG_VALUE) as T;
    }

    const value = evalEngine.getValueToServe(flag, context);

    // TODO: Evaluate flag against user rules
    const flagValue = value ?? defaultValue ?? UNREADY_FLAG_VALUE;

    trackManager.impressionsManager.track({
      flagKey,
      flagValue: flagValue as object,
    });

    return flagValue as T;
  }

  return {
    flag,
  };
}
