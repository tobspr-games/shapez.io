declare module gameanalytics {
    enum EGAErrorSeverity {
        Undefined = 0,
        Debug = 1,
        Info = 2,
        Warning = 3,
        Error = 4,
        Critical = 5,
    }
    enum EGAProgressionStatus {
        Undefined = 0,
        Start = 1,
        Complete = 2,
        Fail = 3,
    }
    enum EGAResourceFlowType {
        Undefined = 0,
        Source = 1,
        Sink = 2,
    }
    module http {
        enum EGAHTTPApiResponse {
            NoResponse = 0,
            BadResponse = 1,
            RequestTimeout = 2,
            JsonEncodeFailed = 3,
            JsonDecodeFailed = 4,
            InternalServerError = 5,
            BadRequest = 6,
            Unauthorized = 7,
            UnknownResponseCode = 8,
            Ok = 9,
            Created = 10,
        }
    }
    module events {
        enum EGASdkErrorCategory {
            Undefined = 0,
            EventValidation = 1,
            Database = 2,
            Init = 3,
            Http = 4,
            Json = 5,
        }
        enum EGASdkErrorArea {
            Undefined = 0,
            BusinessEvent = 1,
            ResourceEvent = 2,
            ProgressionEvent = 3,
            DesignEvent = 4,
            ErrorEvent = 5,
            InitHttp = 9,
            EventsHttp = 10,
            ProcessEvents = 11,
            AddEventsToStore = 12,
        }
        enum EGASdkErrorAction {
            Undefined = 0,
            InvalidCurrency = 1,
            InvalidShortString = 2,
            InvalidEventPartLength = 3,
            InvalidEventPartCharacters = 4,
            InvalidStore = 5,
            InvalidFlowType = 6,
            StringEmptyOrNull = 7,
            NotFoundInAvailableCurrencies = 8,
            InvalidAmount = 9,
            NotFoundInAvailableItemTypes = 10,
            WrongProgressionOrder = 11,
            InvalidEventIdLength = 12,
            InvalidEventIdCharacters = 13,
            InvalidProgressionStatus = 15,
            InvalidSeverity = 16,
            InvalidLongString = 17,
            DatabaseTooLarge = 18,
            DatabaseOpenOrCreate = 19,
            JsonError = 25,
            FailHttpJsonDecode = 29,
            FailHttpJsonEncode = 30,
        }
        enum EGASdkErrorParameter {
            Undefined = 0,
            Currency = 1,
            CartType = 2,
            ItemType = 3,
            ItemId = 4,
            Store = 5,
            FlowType = 6,
            Amount = 7,
            Progression01 = 8,
            Progression02 = 9,
            Progression03 = 10,
            EventId = 11,
            ProgressionStatus = 12,
            Severity = 13,
            Message = 14,
        }
    }
}
export declare var EGAErrorSeverity: typeof gameanalytics.EGAErrorSeverity;
export declare var EGAProgressionStatus: typeof gameanalytics.EGAProgressionStatus;
export declare var EGAResourceFlowType: typeof gameanalytics.EGAResourceFlowType;
declare module gameanalytics {
    module logging {
        class GALogger {
            private static readonly instance;
            private infoLogEnabled;
            private infoLogVerboseEnabled;
            private static debugEnabled;
            private static readonly Tag;
            private constructor();
            static setInfoLog(value: boolean): void;
            static setVerboseLog(value: boolean): void;
            static i(format: string): void;
            static w(format: string): void;
            static e(format: string): void;
            static ii(format: string): void;
            static d(format: string): void;
            private sendNotificationMessage;
        }
    }
}
declare module gameanalytics {
    module utilities {
        class GAUtilities {
            static getHmac(key: string, data: string): string;
            static stringMatch(s: string, pattern: RegExp): boolean;
            static joinStringArray(v: Array<string>, delimiter: string): string;
            static stringArrayContainsString(array: Array<string>, search: string): boolean;
            private static readonly keyStr;
            static encode64(input: string): string;
            static decode64(input: string): string;
            static timeIntervalSince1970(): number;
            static createGuid(): string;
            private static s4;
        }
    }
}
declare module gameanalytics {
    module validators {
        import EGASdkErrorCategory = gameanalytics.events.EGASdkErrorCategory;
        import EGASdkErrorArea = gameanalytics.events.EGASdkErrorArea;
        import EGASdkErrorAction = gameanalytics.events.EGASdkErrorAction;
        import EGASdkErrorParameter = gameanalytics.events.EGASdkErrorParameter;
        class ValidationResult {
            category: EGASdkErrorCategory;
            area: EGASdkErrorArea;
            action: EGASdkErrorAction;
            parameter: EGASdkErrorParameter;
            reason: string;
            constructor(
                category: EGASdkErrorCategory,
                area: EGASdkErrorArea,
                action: EGASdkErrorAction,
                parameter: EGASdkErrorParameter,
                reason: string
            );
        }
        class GAValidator {
            static validateBusinessEvent(
                currency: string,
                amount: number,
                cartType: string,
                itemType: string,
                itemId: string
            ): ValidationResult;
            static validateResourceEvent(
                flowType: EGAResourceFlowType,
                currency: string,
                amount: number,
                itemType: string,
                itemId: string,
                availableCurrencies: Array<string>,
                availableItemTypes: Array<string>
            ): ValidationResult;
            static validateProgressionEvent(
                progressionStatus: EGAProgressionStatus,
                progression01: string,
                progression02: string,
                progression03: string
            ): ValidationResult;
            static validateDesignEvent(eventId: string): ValidationResult;
            static validateErrorEvent(severity: EGAErrorSeverity, message: string): ValidationResult;
            static validateSdkErrorEvent(
                gameKey: string,
                gameSecret: string,
                category: EGASdkErrorCategory,
                area: EGASdkErrorArea,
                action: EGASdkErrorAction
            ): boolean;
            static validateKeys(gameKey: string, gameSecret: string): boolean;
            static validateCurrency(currency: string): boolean;
            static validateEventPartLength(eventPart: string, allowNull: boolean): boolean;
            static validateEventPartCharacters(eventPart: string): boolean;
            static validateEventIdLength(eventId: string): boolean;
            static validateEventIdCharacters(eventId: string): boolean;
            static validateAndCleanInitRequestResponse(
                initResponse: {
                    [key: string]: any;
                },
                configsCreated: boolean
            ): {
                [key: string]: any;
            };
            static validateBuild(build: string): boolean;
            static validateSdkWrapperVersion(wrapperVersion: string): boolean;
            static validateEngineVersion(engineVersion: string): boolean;
            static validateUserId(uId: string): boolean;
            static validateShortString(shortString: string, canBeEmpty: boolean): boolean;
            static validateString(s: string, canBeEmpty: boolean): boolean;
            static validateLongString(longString: string, canBeEmpty: boolean): boolean;
            static validateConnectionType(connectionType: string): boolean;
            static validateCustomDimensions(customDimensions: Array<string>): boolean;
            static validateResourceCurrencies(resourceCurrencies: Array<string>): boolean;
            static validateResourceItemTypes(resourceItemTypes: Array<string>): boolean;
            static validateDimension01(dimension01: string, availableDimensions: Array<string>): boolean;
            static validateDimension02(dimension02: string, availableDimensions: Array<string>): boolean;
            static validateDimension03(dimension03: string, availableDimensions: Array<string>): boolean;
            static validateArrayOfStrings(
                maxCount: number,
                maxStringLength: number,
                allowNoValues: boolean,
                logTag: string,
                arrayOfStrings: Array<string>
            ): boolean;
            static validateClientTs(clientTs: number): boolean;
        }
    }
}
declare module gameanalytics {
    module device {
        class NameValueVersion {
            name: string;
            value: string;
            version: string;
            constructor(name: string, value: string, version: string);
        }
        class NameVersion {
            name: string;
            version: string;
            constructor(name: string, version: string);
        }
        class GADevice {
            private static readonly sdkWrapperVersion;
            private static readonly osVersionPair;
            static readonly buildPlatform: string;
            static readonly deviceModel: string;
            static readonly deviceManufacturer: string;
            static readonly osVersion: string;
            static readonly browserVersion: string;
            static sdkGameEngineVersion: string;
            static gameEngineVersion: string;
            private static connectionType;
            static touch(): void;
            static getRelevantSdkVersion(): string;
            static getConnectionType(): string;
            static updateConnectionType(): void;
            private static getOSVersionString;
            private static runtimePlatformToString;
            private static getBrowserVersionString;
            private static getDeviceModel;
            private static getDeviceManufacturer;
            private static matchItem;
        }
    }
}
declare module gameanalytics {
    module threading {
        class TimedBlock {
            readonly deadline: Date;
            block: () => void;
            readonly id: number;
            ignore: boolean;
            async: boolean;
            running: boolean;
            private static idCounter;
            constructor(deadline: Date);
        }
    }
}
declare module gameanalytics {
    module threading {
        interface IComparer<T> {
            compare(x: T, y: T): number;
        }
        class PriorityQueue<TItem> {
            _subQueues: {
                [key: number]: Array<TItem>;
            };
            _sortedKeys: Array<number>;
            private comparer;
            constructor(priorityComparer: IComparer<number>);
            enqueue(priority: number, item: TItem): void;
            private addQueueOfPriority;
            peek(): TItem;
            hasItems(): boolean;
            dequeue(): TItem;
            private dequeueFromHighPriorityQueue;
        }
    }
}
declare module gameanalytics {
    module store {
        enum EGAStoreArgsOperator {
            Equal = 0,
            LessOrEqual = 1,
            NotEqual = 2,
        }
        enum EGAStore {
            Events = 0,
            Sessions = 1,
            Progression = 2,
        }
        class GAStore {
            private static readonly instance;
            private static storageAvailable;
            private static readonly MaxNumberOfEntries;
            private eventsStore;
            private sessionsStore;
            private progressionStore;
            private storeItems;
            private static readonly StringFormat;
            private static readonly KeyFormat;
            private static readonly EventsStoreKey;
            private static readonly SessionsStoreKey;
            private static readonly ProgressionStoreKey;
            private static readonly ItemsStoreKey;
            private constructor();
            static isStorageAvailable(): boolean;
            static isStoreTooLargeForEvents(): boolean;
            static select(
                store: EGAStore,
                args?: Array<[string, EGAStoreArgsOperator, any]>,
                sort?: boolean,
                maxCount?: number
            ): Array<{
                [key: string]: any;
            }>;
            static update(
                store: EGAStore,
                setArgs: Array<[string, any]>,
                whereArgs?: Array<[string, EGAStoreArgsOperator, any]>
            ): boolean;
            static delete(store: EGAStore, args: Array<[string, EGAStoreArgsOperator, any]>): void;
            static insert(
                store: EGAStore,
                newEntry: {
                    [key: string]: any;
                },
                replace?: boolean,
                replaceKey?: string
            ): void;
            static save(gameKey: string): void;
            static load(gameKey: string): void;
            static setItem(gameKey: string, key: string, value: string): void;
            static getItem(gameKey: string, key: string): string;
            private static getStore;
        }
    }
}
declare module gameanalytics {
    module state {
        class GAState {
            private static readonly CategorySdkError;
            private static readonly MAX_CUSTOM_FIELDS_COUNT;
            private static readonly MAX_CUSTOM_FIELDS_KEY_LENGTH;
            private static readonly MAX_CUSTOM_FIELDS_VALUE_STRING_LENGTH;
            static readonly instance: GAState;
            private constructor();
            private userId;
            static setUserId(userId: string): void;
            private identifier;
            static getIdentifier(): string;
            private initialized;
            static isInitialized(): boolean;
            static setInitialized(value: boolean): void;
            sessionStart: number;
            static getSessionStart(): number;
            private sessionNum;
            static getSessionNum(): number;
            private transactionNum;
            static getTransactionNum(): number;
            sessionId: string;
            static getSessionId(): string;
            private currentCustomDimension01;
            static getCurrentCustomDimension01(): string;
            private currentCustomDimension02;
            static getCurrentCustomDimension02(): string;
            private currentCustomDimension03;
            static getCurrentCustomDimension03(): string;
            private gameKey;
            static getGameKey(): string;
            private gameSecret;
            static getGameSecret(): string;
            private availableCustomDimensions01;
            static getAvailableCustomDimensions01(): Array<string>;
            static setAvailableCustomDimensions01(value: Array<string>): void;
            private availableCustomDimensions02;
            static getAvailableCustomDimensions02(): Array<string>;
            static setAvailableCustomDimensions02(value: Array<string>): void;
            private availableCustomDimensions03;
            static getAvailableCustomDimensions03(): Array<string>;
            static setAvailableCustomDimensions03(value: Array<string>): void;
            private availableResourceCurrencies;
            static getAvailableResourceCurrencies(): Array<string>;
            static setAvailableResourceCurrencies(value: Array<string>): void;
            private availableResourceItemTypes;
            static getAvailableResourceItemTypes(): Array<string>;
            static setAvailableResourceItemTypes(value: Array<string>): void;
            private build;
            static getBuild(): string;
            static setBuild(value: string): void;
            private useManualSessionHandling;
            static getUseManualSessionHandling(): boolean;
            private _isEventSubmissionEnabled;
            static isEventSubmissionEnabled(): boolean;
            sdkConfigCached: {
                [key: string]: any;
            };
            private configurations;
            private remoteConfigsIsReady;
            private remoteConfigsListeners;
            initAuthorized: boolean;
            clientServerTimeOffset: number;
            configsHash: string;
            abId: string;
            static getABTestingId(): string;
            abVariantId: string;
            static getABTestingVariantId(): string;
            private defaultUserId;
            private setDefaultId;
            static getDefaultId(): string;
            sdkConfigDefault: {
                [key: string]: string;
            };
            sdkConfig: {
                [key: string]: any;
            };
            static getSdkConfig(): {
                [key: string]: any;
            };
            private progressionTries;
            static readonly DefaultUserIdKey: string;
            static readonly SessionNumKey: string;
            static readonly TransactionNumKey: string;
            private static readonly Dimension01Key;
            private static readonly Dimension02Key;
            private static readonly Dimension03Key;
            static readonly SdkConfigCachedKey: string;
            static isEnabled(): boolean;
            static setCustomDimension01(dimension: string): void;
            static setCustomDimension02(dimension: string): void;
            static setCustomDimension03(dimension: string): void;
            static incrementSessionNum(): void;
            static incrementTransactionNum(): void;
            static incrementProgressionTries(progression: string): void;
            static getProgressionTries(progression: string): number;
            static clearProgressionTries(progression: string): void;
            static setKeys(gameKey: string, gameSecret: string): void;
            static setManualSessionHandling(flag: boolean): void;
            static setEnabledEventSubmission(flag: boolean): void;
            static getEventAnnotations(): {
                [key: string]: any;
            };
            static getSdkErrorEventAnnotations(): {
                [key: string]: any;
            };
            static getInitAnnotations(): {
                [key: string]: any;
            };
            static getClientTsAdjusted(): number;
            static sessionIsStarted(): boolean;
            private static cacheIdentifier;
            static ensurePersistedStates(): void;
            static calculateServerTimeOffset(serverTs: number): number;
            static validateAndCleanCustomFields(fields: {
                [id: string]: any;
            }): {
                [id: string]: any;
            };
            static validateAndFixCurrentDimensions(): void;
            static getConfigurationStringValue(key: string, defaultValue: string): string;
            static isRemoteConfigsReady(): boolean;
            static addRemoteConfigsListener(listener: { onRemoteConfigsUpdated: () => void }): void;
            static removeRemoteConfigsListener(listener: { onRemoteConfigsUpdated: () => void }): void;
            static getRemoteConfigsContentAsString(): string;
            static populateConfigurations(sdkConfig: { [key: string]: any }): void;
        }
    }
}
declare module gameanalytics {
    module tasks {
        class SdkErrorTask {
            private static readonly MaxCount;
            private static readonly countMap;
            private static readonly timestampMap;
            static execute(url: string, type: string, payloadData: string, secretKey: string): void;
        }
    }
}
declare module gameanalytics {
    module http {
        import EGASdkErrorCategory = gameanalytics.events.EGASdkErrorCategory;
        import EGASdkErrorArea = gameanalytics.events.EGASdkErrorArea;
        import EGASdkErrorAction = gameanalytics.events.EGASdkErrorAction;
        import EGASdkErrorParameter = gameanalytics.events.EGASdkErrorParameter;
        class GAHTTPApi {
            static readonly instance: GAHTTPApi;
            private protocol;
            private hostName;
            private version;
            private remoteConfigsVersion;
            private baseUrl;
            private remoteConfigsBaseUrl;
            private initializeUrlPath;
            private eventsUrlPath;
            private useGzip;
            private static readonly MAX_ERROR_MESSAGE_LENGTH;
            private constructor();
            requestInit(
                configsHash: string,
                callback: (
                    response: EGAHTTPApiResponse,
                    json: {
                        [key: string]: any;
                    }
                ) => void
            ): void;
            sendEventsInArray(
                eventArray: Array<{
                    [key: string]: any;
                }>,
                requestId: string,
                callback: (
                    response: EGAHTTPApiResponse,
                    json: {
                        [key: string]: any;
                    },
                    requestId: string,
                    eventCount: number
                ) => void
            ): void;
            sendSdkErrorEvent(
                category: EGASdkErrorCategory,
                area: EGASdkErrorArea,
                action: EGASdkErrorAction,
                parameter: EGASdkErrorParameter,
                reason: string,
                gameKey: string,
                secretKey: string
            ): void;
            private static sendEventInArrayRequestCallback;
            private static sendRequest;
            private static initRequestCallback;
            private createPayloadData;
            private processRequestResponse;
            private static sdkErrorCategoryString;
            private static sdkErrorAreaString;
            private static sdkErrorActionString;
            private static sdkErrorParameterString;
        }
    }
}
declare module gameanalytics {
    module events {
        class GAEvents {
            private static readonly CategorySessionStart;
            private static readonly CategorySessionEnd;
            private static readonly CategoryDesign;
            private static readonly CategoryBusiness;
            private static readonly CategoryProgression;
            private static readonly CategoryResource;
            private static readonly CategoryError;
            private static readonly MaxEventCount;
            private constructor();
            static addSessionStartEvent(): void;
            static addSessionEndEvent(): void;
            static addBusinessEvent(
                currency: string,
                amount: number,
                itemType: string,
                itemId: string,
                cartType: string,
                fields: {
                    [id: string]: any;
                }
            ): void;
            static addResourceEvent(
                flowType: EGAResourceFlowType,
                currency: string,
                amount: number,
                itemType: string,
                itemId: string,
                fields: {
                    [id: string]: any;
                }
            ): void;
            static addProgressionEvent(
                progressionStatus: EGAProgressionStatus,
                progression01: string,
                progression02: string,
                progression03: string,
                score: number,
                sendScore: boolean,
                fields: {
                    [id: string]: any;
                }
            ): void;
            static addDesignEvent(
                eventId: string,
                value: number,
                sendValue: boolean,
                fields: {
                    [id: string]: any;
                }
            ): void;
            static addErrorEvent(
                severity: EGAErrorSeverity,
                message: string,
                fields: {
                    [id: string]: any;
                }
            ): void;
            static processEvents(category: string, performCleanUp: boolean): void;
            private static processEventsCallback;
            private static cleanupEvents;
            private static fixMissingSessionEndEvents;
            private static addEventToStore;
            private static updateSessionStore;
            private static addDimensionsToEvent;
            private static addFieldsToEvent;
            private static resourceFlowTypeToString;
            private static progressionStatusToString;
            private static errorSeverityToString;
        }
    }
}
declare module gameanalytics {
    module threading {
        class GAThreading {
            private static readonly instance;
            readonly blocks: PriorityQueue<TimedBlock>;
            private readonly id2TimedBlockMap;
            private static runTimeoutId;
            private static readonly ThreadWaitTimeInMs;
            private static ProcessEventsIntervalInSeconds;
            private keepRunning;
            private isRunning;
            private constructor();
            static createTimedBlock(delayInSeconds?: number): TimedBlock;
            static performTaskOnGAThread(taskBlock: () => void, delayInSeconds?: number): void;
            static performTimedBlockOnGAThread(timedBlock: TimedBlock): void;
            static scheduleTimer(interval: number, callback: () => void): number;
            static getTimedBlockById(blockIdentifier: number): TimedBlock;
            static ensureEventQueueIsRunning(): void;
            static endSessionAndStopQueue(): void;
            static stopEventQueue(): void;
            static ignoreTimer(blockIdentifier: number): void;
            static setEventProcessInterval(interval: number): void;
            private addTimedBlock;
            private static run;
            private static startThread;
            private static getNextBlock;
            private static processEventQueue;
        }
    }
}
declare module gameanalytics {
    class GameAnalytics {
        private static initTimedBlockId;
        static methodMap: {
            [id: string]: (...args: any[]) => void;
        };
        static init(): void;
        static gaCommand(...args: any[]): void;
        static configureAvailableCustomDimensions01(customDimensions?: Array<string>): void;
        static configureAvailableCustomDimensions02(customDimensions?: Array<string>): void;
        static configureAvailableCustomDimensions03(customDimensions?: Array<string>): void;
        static configureAvailableResourceCurrencies(resourceCurrencies?: Array<string>): void;
        static configureAvailableResourceItemTypes(resourceItemTypes?: Array<string>): void;
        static configureBuild(build?: string): void;
        static configureSdkGameEngineVersion(sdkGameEngineVersion?: string): void;
        static configureGameEngineVersion(gameEngineVersion?: string): void;
        static configureUserId(uId?: string): void;
        static initialize(gameKey?: string, gameSecret?: string): void;
        static addBusinessEvent(
            currency?: string,
            amount?: number,
            itemType?: string,
            itemId?: string,
            cartType?: string
        ): void;
        static addResourceEvent(
            flowType?: EGAResourceFlowType,
            currency?: string,
            amount?: number,
            itemType?: string,
            itemId?: string
        ): void;
        static addProgressionEvent(
            progressionStatus?: EGAProgressionStatus,
            progression01?: string,
            progression02?: string,
            progression03?: string,
            score?: any
        ): void;
        static addDesignEvent(eventId: string, value?: any): void;
        static addErrorEvent(severity?: EGAErrorSeverity, message?: string): void;
        static setEnabledInfoLog(flag?: boolean): void;
        static setEnabledVerboseLog(flag?: boolean): void;
        static setEnabledManualSessionHandling(flag?: boolean): void;
        static setEnabledEventSubmission(flag?: boolean): void;
        static setCustomDimension01(dimension?: string): void;
        static setCustomDimension02(dimension?: string): void;
        static setCustomDimension03(dimension?: string): void;
        static setEventProcessInterval(intervalInSeconds: number): void;
        static startSession(): void;
        static endSession(): void;
        static onStop(): void;
        static onResume(): void;
        static getRemoteConfigsValueAsString(key: string, defaultValue?: string): string;
        static isRemoteConfigsReady(): boolean;
        static addRemoteConfigsListener(listener: { onRemoteConfigsUpdated: () => void }): void;
        static removeRemoteConfigsListener(listener: { onRemoteConfigsUpdated: () => void }): void;
        static getRemoteConfigsContentAsString(): string;
        static getABTestingId(): string;
        static getABTestingVariantId(): string;
        private static internalInitialize;
        private static newSession;
        private static startNewSessionCallback;
        private static resumeSessionAndStartQueue;
        private static isSdkReady;
    }
}
declare var GameAnalyticsCommand: typeof gameanalytics.GameAnalytics.gaCommand;
export declare var GameAnalytics: typeof gameanalytics.GameAnalytics;
export default GameAnalytics;
