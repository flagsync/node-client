import { FsSettings } from '~config/types.internal';

import { FsServiceError } from '~api/error/service-error';
import { ServiceErrorFactory } from '~api/error/service-error-factory';
import { Sdk } from '~api/sdk';

import { FsEvent, IEventManager } from '~managers/event/types';
import { IStoreManager } from '~managers/storage/types';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

const format = formatMsg.bind(null, 'service-manager');

export function serviceManager(
  settings: FsSettings,
  sdk: Sdk<any>,
  storageManager: IStoreManager,
  eventEmitter: IEventManager,
) {
  const { log, context, metadata } = settings;

  const initWithWithThrow = sdk
    .sdkControllerInitContext({
      context,
      sdkContext: {
        sdkName: metadata.sdkName,
        sdkVersion: metadata.sdkVersion,
      },
    })
    .then(() =>
      sdk.sdkControllerGetFlagRules({
        context,
        sdkContext: {
          sdkName: metadata.sdkName,
          sdkVersion: metadata.sdkVersion,
        },
      }),
    )
    .then((res) => {
      storageManager.set(res?.flags ?? {});
      log.debug(format(MESSAGE.SDK_READY));
      eventEmitter.emit(FsEvent.SDK_READY);
    })
    .catch((e: unknown) => {
      throw ServiceErrorFactory.create(e);
    });

  const initWithCatch = initWithWithThrow.catch((e: FsServiceError) => {
    log.error(format(MESSAGE.SDK_FAILED), e.path, e.errorCode, e.message);
    eventEmitter.emit(FsEvent.ERROR, {
      type: 'api',
      error: e,
    });
  });

  return {
    initWithCatch,
    initWithWithThrow,
  };
}
