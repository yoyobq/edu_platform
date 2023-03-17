declare namespace USER {
  type LoginResult = {
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type LoginParams = {
    loginName?: string;
    loginPassword?: string;
    autoLogin?: boolean;
    type?: string;
  };
}
