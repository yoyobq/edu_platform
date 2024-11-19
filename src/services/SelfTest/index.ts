// @ts-ignore
/* eslint-disable */
// import moment from 'moment';
import { request } from '@umijs/max';
import { gql } from 'graphql-tag';

// 组卷开始
// 组卷第一步： 从指定题库按类型抽取题目
async function extractQuestionsByType(
  tableName: string,
  type: string, // 目前支持 [sgl, mul, jud, mix] mix 即混合所有题型
) {
  // 注意这是一个拼接字符串的实例,query 后是 query 的名字
  type = type === 'mix' ? '' : type;
  const query = gql`
    query {
      questions(tableName: "${tableName}", type: "${type}") {
        id
        custom_id
        topic
        a
        b
        c
        d
        e
        f
        g
        chapter_no
        chapter
        pic_path
        answer
        type
        remark
      }
    }
  `;

  const data = {
    query: query.loc?.source.body,
    operationName: 'questions', // 操作名称，选填，查询文档有多个操作时必填
    // variables, // 对象集合，选填
  };
  return request<API.ResponseData>('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
    // ...(options || {}),
  }).then((response) => {
    // response 中包含了 account 和 token
    if (response.success) {
      return response.data;
    }
    throw new Error('从后台获取试题失败。');
  });
}
// 当函数定义较长而难以一行内显示时，可以使用以下方式来改进：
export async function extractQuestionsList(extractionRules: SelfTest.RuleProp[]): Promise<any> {
  // ): Promise<SelfTest.QuestionProps[]> {
  let questionsList: { questions: SelfTest.Question[] }[] = [];

  try {
    // 分别获取抽题规则 ruleList 中规定的各类型的题目
    for (const { tableName, type } of extractionRules) {
      const extractedQuestions: { questions: SelfTest.Question[] } = await extractQuestionsByType(
        tableName,
        type,
      );
      questionsList = questionsList.concat(extractedQuestions);
    }
  } catch (error) {
    // 由于在与后台抽取数据时已经 catch 了 error，此处出错的概率极低
    // 但仍保留一段排错信息，维持代码的健壮性
    console.error(`Error extracting questions: ${error}`);
    // questions = questions.concat([]);
  }

  return questionsList;
}
