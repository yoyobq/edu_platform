/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: USER.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  const access: string[] | undefined = currentUser?.accessGroup;
  return {
    canSuperAdmin: currentUser && access?.includes('superAdmin'),
    canAdmin: currentUser && access?.includes('admin'),
    canManager: (currentUser && access?.includes('manager')) || access?.includes('admin'),
    canTeacher: (currentUser && access?.includes('teacher')) || access?.includes('admin'),
  };
}
