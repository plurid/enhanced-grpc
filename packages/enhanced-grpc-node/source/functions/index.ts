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
    // #endregion external
// #endregion imports



// #region module
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


export const clientCall = async <R, D>(
    client: grpc.Client | undefined,
    name: string,
    data: D,
): Promise<R> => {
    const response = await new Promise<R>(
        (resolve, reject) => {
            if (!client) {
                reject();
                return;
            }

            const callback = (
                error: any,
                response: R,
            ) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(response);
            }

            (client as any)[name](data, callback);
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
 */
export const tryClientCall = async <R, D>(
    client: grpc.Client | undefined,
    name: string,
    data: D,
): Promise<ClientCallResponse<R>> => {
    try {
        const response = await clientCall<R, D>(
            client,
            name,
            data,
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
