import grpc from 'grpc';
import * as protoLoader from '@grpc/proto-loader';

import {
    ClientOptions,
    ClientCallResponse,
} from '../data/interfaces';



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

        const grpcService = grpc.loadPackageDefinition(packageDefinition)[service];

        const client = new (grpcService as any)(
            url,
            grpc.credentials.createInsecure(),
        );

        return client;
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
    client: any,
    name: string,
    data: D,
): Promise<R> => {
    const response = await new Promise<R>(
        (resolve, reject) => {
            const callback = (
                err: any,
                response: R,
            ) => {
                if (err) {
                    reject();
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
 */
export const tryClientCall = async <R, D>(
    client: any,
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
