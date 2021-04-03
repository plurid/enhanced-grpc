// #region methods
const CLIENT_CALL_TIMEOUT = parseInt(process.env.ENHANCED_GRPC_CLIENT_CALL_TIMEOUT || '') || 10; // seconds
// #endregion methods



// #region exports
export {
    CLIENT_CALL_TIMEOUT,
};
// #endregion exports
