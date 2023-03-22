declare namespace USER {
  type AccountStatus = {
    id: number;
    status: number;
    type?: string;
  };

  type LoginResult = {
    checkAccount?: accountStatus | null;
  };

  type LoginParams = {
    loginName?: string;
    loginPassword?: string;
    autoLogin?: boolean;
    type?: string;
  };
}
