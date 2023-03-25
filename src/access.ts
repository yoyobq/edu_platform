/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: USER.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  const access: string[] | undefined = currentUser?.accessGroup;
  return {
    canAdmin: currentUser && access?.includes('admin'),
    canTeacher: (currentUser && access?.includes('teacher')) || access?.includes('admin'),
  };
}
