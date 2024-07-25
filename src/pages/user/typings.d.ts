declare namespace USER {
  type AccountStatus = {
    id?: number;
    status?: string;
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

  type UpdateParams = {
    id: number;
    loginName?: string;
    loginEmail?: string;
    loginPassword?: string;
  };

  type CurrentUser = {
    id?: number;
    accountId?: number;
    avatar?: string;
    email?: string;
    signature?: string;
    accessGroup?: string[]; // ['admin', 'teacher']
    address?: string;
    phone?: string;
    tags?: { key?: string; label?: string }[];
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    notifyCount?: number;
    unredCount?: number;
    access?: string;
  };

  // type CurrentUser = {
  //   id?: number;
  //   name?: string;
  //   avatar?: string;
  //   // userid?: string;
  //   email?: string;
  //   signature?: string;
  //   title?: string;
  //   userAccess?: string[];
  //   tags?: { key?: string; label?: string }[];
  //   notifyCount?: number;
  //   unreadCount?: number;
  //   country?: string;
  //   access?: string;
  //   geographic?: {
  //     province?: { label?: string; key?: string };
  //     city?: { label?: string; key?: string };
  //   };
  //   address?: string;
  //   phone?: string;
  // };
}
