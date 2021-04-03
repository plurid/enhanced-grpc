// #region imports
    // #region libraries
    import grpc from 'grpc';

    import * as protoLoader from '@grpc/proto-loader';
    // #endregion libraries


    // #region external
    import {
        ClientOptions,
        ClientCallResponse,
    } from '~data/interfaces';

    import {
        CLIENT_CALL_TIMEOUT,
    } from '~data/constants';
    // #endregion external
// #endregion imports



// #region module
/**
 * Generate a client.
 *
 * @param options
 */
export const generateClient = (
    options: ClientOptions,
) => {
    const {
        protocolBuffers,
        protocolBuffersDirectories,
        service,
        url,
    } = options;

    try {
        const packageDefinition = protoLoader.loadSync(
            protocolBuffers,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
                includeDirs: protocolBuffersDirectories,
            },
        );

        const loadedPackageDefinition = grpc.loadPackageDefinition(packageDefinition);

        const grpcServiceClient = loadedPackageDefinition[service];

        if (typeof grpcServiceClient === 'function') {
            const client = new grpcServiceClient(
                url,
                grpc.credentials.createInsecure(),
            );

            return client;
        }

        return;
    } catch (error) {
        if (options.quiet) {
            return;
        }

        if (options.debug) {
            console.log(`gRPC Client could not be reached at: ${url}`, error);
        } else {
            console.log(`gRPC Client could not be reached at: ${url}`);
        }

        return;
    }
}


/**
 * Call the client.
 *
 * @param client
 * @param name
 * @param data
 * @param timeout seconds
 */
export const clientCall = async <R, D>(
    client: grpc.Client | undefined,
    name: string,
    data: D,
    timeout = CLIENT_CALL_TIMEOUT,
): Promise<R> => {
    const start = Date.now();
    let responded = false;

    const response = await new Promise<R>(
        (resolve, reject) => {
            if (!client) {
                reject('No gRPC client');
                return;
            }

            const clientProcedure = client[name];
            if (!clientProcedure) {
                reject(`No gRPC procedure '${name}'`);
                return;
            }

            const timeoutInterval = setInterval(
                () => {
                    if (responded) {
                        clearInterval(timeoutInterval);
                        return;
                    }

                    const now = Date.now();
                    if (start + timeout * 1000 > now) {
                        clearInterval(timeoutInterval);
                        reject('gRPC client call timeout');
                    }
                },
                1_000,
            );

            const callback = (
                error: any,
                response: R,
            ) => {
                responded = true;

                if (error) {
                    reject(error);
                    return;
                }

                resolve(response);
            }

            client[name](data, callback);
        }
    );

    return response;
}


/**
 * Attempt to call on the `client` the `named` function with the passed `data`.
 *
 * @param client
 * @param name
 * @param data
 * @param timeout seconds
 */
export const tryClientCall = async <R, D>(
    client: grpc.Client | undefined,
    name: string,
    data: D,
    timeout = CLIENT_CALL_TIMEOUT,
): Promise<ClientCallResponse<R>> => {
    try {
        const response = await clientCall<R, D>(
            client,
            name,
            data,
            timeout,
        );

        return {
            status: true,
            response,
        };
    } catch (error) {
        return {
            status: false,
            error,
        };
    }
}
// #endregion module
