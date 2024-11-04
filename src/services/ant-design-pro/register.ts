import { request } from '@umijs/max';
import { gql } from 'graphql-tag';

/** 验证教师身份 */
export async function validateTeacherIdentity({ name, jobId }: { name: string; jobId: string }) {
  // 拼接后的格式为 [jobId]name
  const formattedName = `[${jobId}]${name}`;

  const variables = {
    name: formattedName,
    jobId: parseInt(jobId, 10),
  };

  const query = gql`
    query ($name: String!, $jobId: Int!) {
      existsStaffIndex(name: $name, jobId: $jobId)
    }
  `;

  const data = {
    query: query.loc?.source.body,
    operationName: null,
    variables,
  };

  return request<API.ResponseData>('/graphql/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  }).then((response) => {
    if (response.success) {
      return response.data.existsStaffIndex;
    }
    throw new Error('教师姓名与工号不匹配');
  });
}

/** 获取学生信息 */
export async function fetchStudentInfo(studentId: string, name: string) {
  const variables = {
    studentId: parseInt(studentId, 10),
    name,
  };

  const query = gql`
    query ($studentId: Int!, $name: String!) {
      getStudentInfo(studentId: $studentId, name: $name) {
        studentId
        name
        department
        advisorName
      }
    }
  `;

  const data = {
    query: query.loc?.source.body,
    operationName: null,
    variables,
  };

  return request<API.ResponseData>('/graphql/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  }).then((response) => {
    if (response.success) {
      return response.data.getStudentInfo;
    }
    throw new Error('获取学生信息失败');
  });
}

/** 根据 JobId 检查是否存在 Staff */
export async function checkStaffByJobId({ jobId }: { jobId: string }) {
  const variables = {
    jobId: parseInt(jobId, 10),
  };

  const query = gql`
    query ($jobId: Int!) {
      userStaffByJobId(jobId: $jobId) {
        id
        name
        accountId
      }
    }
  `;

  const data = {
    query: query.loc?.source.body,
    operationName: null,
    variables,
  };

  return request<API.ResponseData>('/graphql/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  }).then((response) => {
    if (response.success) {
      return response.data.userStaffByJobId;
    }
    throw new Error('根据 JobId 获取 Staff 失败');
  });
}

/** 验证邮箱是否已被使用 */
export async function checkEmailUsage({ loginEmail }: { loginEmail: string }) {
  const query = gql`
    query ($loginEmail: String!) {
      userByLoginEmail(loginEmail: $loginEmail) {
        id
      }
    }
  `;

  const variables = {
    loginEmail,
  };

  const data = {
    query: query.loc?.source.body,
    operationName: null,
    variables,
  };

  return request<API.ResponseData>('/graphql/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  }).then((response) => {
    // 正常 repsonse 既 success，是否存在还需进一步判断
    if (response.success) {
      // 如果返回了 account 对象，说明邮箱已经被使用
      if (response.data.userByLoginEmail) {
        return {
          used: true,
          account: response.data.userByLoginEmail, // 返回已存在的用户信息
        };
      } else {
        return {
          used: false,
          account: null, // 邮箱未被使用
        };
      }
    }
    throw new Error('请求失败，无法验证邮箱');
  });
}

/** 发送注册验证邮件 */
export async function sendRegistrationEmail({
  applicantType,
  role,
  email,
  applicantId,
  issuerId,
  // expiryTime,
  data,
}: {
  applicantType: string;
  role: string;
  email: string;
  applicantId: number;
  issuerId: number;
  // expiryTime: number;
  data?: Record<string, any>;
}) {
  const mutation = gql`
    mutation ($params: VerifEmailInput!) {
      sendVerifEmail(params: $params)
    }
  `;

  const variables = {
    params: {
      applicantType,
      role,
      email,
      applicantId,
      issuerId,
      // expiryTime,
      data,
    },
  };

  const dataPayload = {
    query: mutation.loc?.source.body,
    operationName: null,
    variables,
  };

  return request<API.ResponseData>('/graphql/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: dataPayload,
  }).then((response) => {
    if (response.success && response.data.sendVerifEmail) {
      return true; // 邮件发送成功
    }

    return false;
  });
}

/** 发送密码重置邮件 */
export async function sendPwdResetEmail({
  // applicantType,
  // role,
  email,
  // applicantId,
  // issuerId,
  // data,
}: {
  // applicantType: string;
  // role: string;
  email: string;
  // applicantId: number;
  // issuerId: number;
  // data?: Record<string, any>;
}) {
  // console.log(data);
  const mutation = gql`
    mutation ($params: VerifEmailInput!) {
      sendVerifEmail(params: $params)
    }
  `;

  const variables = {
    params: {
      applicantType: 'pwdreset',
      role: 'UNKNOWN',
      email,
      applicantId: '0',
      issuerId: '0',
      data: {
        email,
      },
    },
  };

  const dataPayload = {
    query: mutation.loc?.source.body,
    operationName: null,
    variables,
  };

  return request<API.ResponseData>('/graphql/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: dataPayload,
  }).then((response) => {
    if (response.success && response.data.sendVerifEmail) {
      return true; // 邮件发送成功
    }

    return false;
  });
}

/** 发送验证码进行二次验证 */
export async function checkVerifCode({
  // 其他数据被注释掉是因为这些内容均可从验证码推断，估不再二次提交，由验证码解析后得出
  // 这样也可以防止获得验证码后利用特殊手段篡改注册信息
  // name,
  // jobId,
  // email,
  verifCode,
}: {
  // name: string;
  // jobId: string;
  // email: string;
  verifCode: string;
}) {
  // 定义 GraphQL 变量
  const variables = {
    verifCode,
  };

  // 定义 GraphQL 查询
  const mutation = gql`
    mutation ($verifCode: String!) {
      checkVerifCode(params: { verifCode: $verifCode })
    }
  `;

  // 构造请求体
  const data = {
    query: mutation.loc?.source.body, // 获取 GraphQL 查询的 body
    operationName: null,
    variables,
  };

  // 使用 request 发送请求
  return request<API.ResponseData>('/graphql/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  })
    .then((response) => {
      if (response.success && response.data.checkVerifCode) {
        return response.data.checkVerifCode; // 返回布尔值，表示验证结果
      }
      throw new Error('验证码验证失败');
    })
    .catch((error) => {
      throw error; // 验证失败时返回 false
    });
}

/** 提交数据，完成用户注册流程 */
export async function registerUser({
  loginEmail,
  loginName,
  loginPassword,
  nickname,
  verifCode,
}: {
  loginEmail: string;
  loginName: string;
  loginPassword: string;
  nickname?: string;
  verifCode: string;
}) {
  // 构造 GraphQL 变量
  const variables = {
    input: {
      loginEmail,
      loginName,
      loginPassword,
      nickname,
      verifCode,
    },
  };

  // 定义 GraphQL Mutation
  const mutation = gql`
    mutation ($input: RegisterUserInput!) {
      registerUser(input: $input)
    }
  `;

  // 构造请求体
  const data = {
    query: mutation.loc?.source.body, // 获取 GraphQL 查询的 body
    operationName: null,
    variables,
  };

  console.log(data);
  console.log(variables);

  // 使用 request 发送请求
  return request<API.ResponseData>('/graphql/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  })
    .then((response) => {
      console.log(response);
      if (response.success && response.data.registerUser) {
        return true; // 返回 true，表示注册成功
      }
      throw new Error('注册失败');
    })
    .catch((error) => {
      throw error; // 注册失败时抛出错误
    });
}

export async function resetPassword({
  verifCode,
  password,
}: {
  verifCode?: string;
  password: string;
}) {
  // 如果没有提供 verifCode，立即返回
  if (!verifCode) {
    throw new Error('非法操作！');
  }

  // 定义 GraphQL 变量
  const variables = {
    input: {
      verifCode,
      newPassword: password,
    },
  };

  // console.log(variables);

  // 定义 GraphQL Mutation
  const mutation = gql`
    mutation ($input: ResetPasswordInput!) {
      userResetPassword(input: $input)
    }
  `;

  // 构造请求体
  const data = {
    query: mutation.loc?.source.body, // 获取 GraphQL 查询的 body
    operationName: null,
    variables,
  };
  // console.log(data);
  // 使用 request 发送请求
  return request<API.ResponseData>('/graphql/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  })
    .then((response) => {
      if (response.success && response.data.userResetPassword) {
        return true; // 返回布尔值，表示重置成功
      }
      throw new Error(response.errorMessage || '密码重置失败');
    })
    .catch((error) => {
      console.error('Password reset failed:', error);
      throw error; // 返回错误信息
    });
}
