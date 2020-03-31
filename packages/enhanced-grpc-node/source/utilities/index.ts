import grpc from 'grpc';
import * as protoLoader from '@grpc/proto-loader';

import {
    ClientOptions,
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
        console.log(`gRPC Client could not be reached at: ${url}`);
        return;
    }
}


export const clientCall = async <T>(
    client: any,
    name: string,
    data: T,
): Promise<any> => {
    const response: any = await new Promise(
        (resolve, reject) => {
            const callback = (
                err: any,
                response: any,
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
