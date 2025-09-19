const HTTP_STATUS_CODES = {
  StatusBadRequest: 400,
  StatusUnauthorized: 401,
  StatusPaymentRequired: 402,
  StatusNotAllowed: 403,
  StatusNotFound: 404,
  StatusMethodNotAllowed: 405,
  StatusOk: 200,
  StatusCreated: 201,
  StatusAccepted: 202,
  StatusMovedPermanently: 301,
  StatusFound: 302,
  StatusTemporaryRedirect: 307,
  StatusInternalServerError: 500,
  StatusNotImplemented: 501,
  StatusBadGateway: 502,
  StatusGatewayTimeout: 504,
};

export default HTTP_STATUS_CODES;
