/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * 权限控制模块 - 层级化实现
 * 该模块负责根据用户角色确定其在系统中的访问权限
 */
export default function access(initialState: { currentUser?: USER.CurrentUser } | undefined) {
  // 从初始状态中获取当前用户信息，如果不存在则使用空对象
  const { currentUser } = initialState ?? {};

  // 获取用户的权限组列表，可能是undefined
  const access: string[] | undefined = currentUser?.accessGroup;

  /**
   * 定义权限层级关系
   * 键：角色名称
   * 值：该角色可以继承的所有下级角色列表
   * 例如：superAdmin 可以继承 admin、manager 和 teacher 的所有权限
   */
  const roleHierarchy: Record<string, string[]> = {
    // 超管
    superAdmin: [
      'admin',
      'manager',
      'teacher',
      'academicAssistant',
      'teachingAssistant',
      'student',
    ],
    // 管理员
    admin: ['manager', 'teacher', 'academicAssistant', 'teachingAssistant'],
    // 部门主任
    manager: ['teacher', 'academicAssistant', 'teachingAssistant'],
    // 教师
    teacher: ['teachingAssistant'],
    // 教务员
    academicAssistant: [],
    // 学生助教
    teachingAssistant: ['student'],
    // 学生
    student: [],
  };

  /**
   * 检查用户是否拥有指定角色或其上级角色的权限
   * @param {string} role 要检查的角色名称
   * @returns 如果用户拥有该角色或其上级角色的权限，则返回true；否则返回false
   */
  const hasRole = (role: string): boolean => {
    // 如果用户不存在或没有权限组，直接返回false
    if (!currentUser || !access) return false;

    // 如果用户直接拥有该角色，返回true
    if (access.includes(role)) return true;

    // 检查用户是否拥有更高级别的角色
    // 遍历权限层级关系表
    for (const [higherRole, lowerRoles] of Object.entries(roleHierarchy)) {
      // 如果用户拥有更高级别的角色，且该角色可以继承当前检查的角色
      if (access.includes(higherRole) && lowerRoles.includes(role)) {
        return true;
      }
    }

    // 如果以上条件都不满足，则用户没有该角色权限
    return false;
  };

  // 返回权限检查函数对象
  // 这些函数将被用于路由和组件的权限控制
  return {
    // 检查是否拥有超级管理员权限
    canSuperAdmin: hasRole('superAdmin'),

    // 检查是否拥有管理员权限
    canAdmin: hasRole('admin'),

    // 检查是否拥有经理权限
    canManager: hasRole('manager'),

    // 检查是否拥有教师权限
    canTeacher: hasRole('teacher'),

    // 检查是否拥有教务助手权限
    canAcademicAssistant: hasRole('academicAssistant'),

    // 检查是否拥有教学助手权限
    canTeachingAssistant: hasRole('teachingAssistant'),

    canStudent: hasRole('student'),
  };
}
