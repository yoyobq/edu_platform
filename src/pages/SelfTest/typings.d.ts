declare namespace SELFTEST {
  // type AccountStatus = {
  //   id?: number;
  //   status?: number;
  //   type?: string;
  // };

  // type LoginResult = {
  //   checkAccount?: accountStatus | null;
  // };

  // type LoginParams = {
  //   loginName?: string;
  //   loginPassword?: string;
  //   autoLogin?: boolean;
  //   type?: string;
  // };

  type Question = {
    id?: number;
    custom_id: number;
    topic: string;
    a: string;
    b: string;
    c: string;
    d?: string;
    e?: string;
    f?: string;
    g?: string;
    answer: string;
    type: string;
    chapter_no?: number;
    chapter?: string;
    pic_path?: string;
    remark?: string;
  };
}

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
