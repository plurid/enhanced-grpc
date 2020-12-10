// #region module
export interface ClientOptions {
    protocolBuffers: string[];
    protocolBuffersDirectories: string[];
    service: string;
    url: string;
    debug?: boolean;
    quiet?: boolean;
}


export interface FailedClientCallResponse {
    status: false;
    error: any;
}

export interface SuccessfulClientCallResponse<R> {
    status: true;
    response: R;
}

export type ClientCallResponse<R> =
    | FailedClientCallResponse
    | SuccessfulClientCallResponse<R>;
// #endregion module
