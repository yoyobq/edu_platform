import { extractQuestionsList } from '@/services/SelfTest/index';

let generatedTest: { questions: SelfTest.QuestionProps[] }[] = [];
// 组卷信息第一部分：题库
// const tableName = 'wlgjg_2104';
// const tableName = 'czxt_2206';
const tableName = 'web_design_copy';

// 组卷信息第二部分： 题库的构成(抽取规则)，是否乱序
const isSort = false;
let ruleIdx = -1;
const extractionRules: SelfTest.RuleProp[] = [
  {
    tableName, // 抽题题库
    id: (ruleIdx += 1),
    type: 'sgl', // 不同题型，支持单选，多选，判断
    describe: '单选题',
    startQuNo: 1, // 从哪道题
    endQuNo: 173, // 到那道题
    quantity: 100, // 抽题数量
    scorePreQu: 1, // 每题得分
    maxNumber: 173,
  },
  // {
  //   tableName,
  //   id: (ruleIdx += 1),
  //   type: 'mul',
  //   describe: '多选题',
  //   startQuNo: 1,
  //   endQuNo: 15,
  //   quantity: 10,
  //   scorePreQu: 5,
  //   maxNumber: 15,
  // },
  // {
  //   tableName: 'wlgjg_2103',
  //   id: (ruleIdx += 1),
  //   type: 'jug',
  //   describe: '判断题',
  //   startQuNo: 1,
  //   endQuNo: 300,
  //   quantity: 10,
  //   scorePreQu: 1,
  //   maxNumber: 400,
  // },
];

// 组卷第三步：分类抽取原始题库中的所有试题
async function extractQuestions() {
  return extractQuestionsList(extractionRules);
}

// 打乱题目
const disarrayQuestions = (questions: SelfTest.Question[]) => {
  let questionsLen: number = questions.length;
  let randIndex: number;
  let tempItem;
  // 此处是浅拷贝
  const disarrayArr: SelfTest.Question[] = questions;
  while (questionsLen) {
    randIndex = Math.floor(Math.random() * questionsLen);
    questionsLen -= 1;
    tempItem = disarrayArr[questionsLen];
    disarrayArr[questionsLen] = disarrayArr[randIndex];
    disarrayArr[randIndex] = tempItem;
  }

  return disarrayArr;
};

// 根据规则，进一步过滤题库，满足规则中的细节
// const sortArr = (questions: SelfTest.Question[]) =>
//   questions.sort((a: SelfTest.Question, b:SelfTest.Question) => a.id! - b.id!);
// const filterQuestions = (questionsList: { questions: SelfTest.Question[]}[]) => {
//   // 取规定范围题目
//   let filteredQuestionsList:{ questions: SelfTest.Question[]}[] = [];
//   for (let n=0; n < questionsList.length; n++) {
//     // 1 - 200 下标是 0 - 199
//     let filteredQuestions: SelfTest.Question[];
//     filteredQuestions = questionsList[n].questions.slice(extractionRules[n].startQuNo - 1, extractionRules[n].endQuNo);
//     // 打乱
//     filteredQuestions = disarrayQuestions(filteredQuestions);
//     // 取规定数量
//     filteredQuestions = filteredQuestions.slice(0, extractionRules[n].quantity);
//     // 排序
//     sortQuestions(filteredQuestions);
//     filteredQuestionsList = filteredQuestionsList.concat({questions: filteredQuestions});
//   }
//   return filteredQuestionsList;
// }

// 这里是上面注释掉代码的链式调用简写版
const filterQuestions = (questionsList: { questions: SelfTest.Question[] }[]) =>
  questionsList.map(({ questions }, idx) => ({
    questions: disarrayQuestions(
      questions.slice(extractionRules[idx].startQuNo - 1, extractionRules[idx].endQuNo),
    ).slice(0, extractionRules[idx].quantity),
  }));

// 对过滤后的数组进行排序
const sortQuestions = (questionsList: { questions: SelfTest.Question[] }[]) =>
  questionsList.map(({ questions }) => ({
    questions: questions.sort((a: SelfTest.Question, b: SelfTest.Question) => a.id! - b.id!),
  }));

// 转化数据库中的某“一题”，变成符合 view 中的“一题”的结构
const transformQuestion = (question: SelfTest.Question, idx: number): SelfTest.QuestionProps => {
  const optionsKeys: (keyof SelfTest.Question)[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  const options = optionsKeys
    .map((optionKey) => question[optionKey])
    // as string[] 断言 filter 过滤后一定是一个字符串，
    // 则 options 就一定是一个字符串数组
    .filter((option) => option !== undefined && option !== null) as string[];

  return {
    custom_id: question.custom_id,
    topic: question.topic,
    options,
    answer: question.answer,
    type: question.type,
    chapter: question.chapter,
    pic_path: question.pic_path,
    remarks: question.remark,
    currentAnswer: '',
    isCorrect: undefined,
    orderedTag: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    No: idx,
    onChange: undefined,
  };
};

// 把数据库中抽取并过滤出来的试题，进一步格式化成 view 层需要的数据格式
const transformQuestions = (questionsList: { questions: SelfTest.Question[] }[]) =>
  questionsList.map(({ questions }, idx) => {
    let title: string = '';
    if (questions.length !== 0) {
      title = `\
        ${extractionRules[idx].describe}\
        （共${extractionRules[idx].quantity}题，\
        每题${extractionRules[idx].scorePreQu}分，\
        总分${extractionRules[idx].scorePreQu * extractionRules[idx].quantity}分）`;
    }

    return {
      // questions.map(({ question: SelfTest.Question }, idx) => transformQuestion(question, idx))
      id: idx,
      title,
      type: extractionRules[idx].type,
      questions: questions.map((question, idx) => transformQuestion(question, idx)),
    };
  });

// 组卷信息第三部分：试卷评分
export const calScore = (
  testStatus: SelfTest.TestStatus,
  questionsList: SelfTest.QuestionsListProps[],
): SelfTest.TestStatus => {
  const { hasFinished, score } = testStatus;

  if (hasFinished || score >= 0) {
    return testStatus;
  }

  const newStatus: SelfTest.TestStatus = {
    hasFinished: true,
    score: 0,
  };

  // 根据不同的题型结分
  extractionRules.forEach((rule: SelfTest.RuleProp) => {
    // 分别统计每一类题做对题数
    let correctNum: number = 0;
    // 单项得分
    let itemScore: number = 0;

    questionsList[rule.id].questions.forEach((question: SelfTest.QuestionProps) => {
      if (question.isCorrect) {
        correctNum += 1;
      }
    });

    itemScore = correctNum * rule.scorePreQu;
    const time = new Date();
    const timeStr: string = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
    // eslint-disable-next-line no-console
    console.log(
      `抽题规则: ${rule.type}/${rule.startQuNo}/${rule.endQuNo}/${rule.quantity}/${rule.scorePreQu}`,
    );
    // eslint-disable-next-line no-console
    console.log(
      `抽题时间: ${timeStr}-${rule.describe}: ${correctNum} * ${rule.scorePreQu} = ${itemScore}`,
    );

    newStatus.score += itemScore;
  });

  return newStatus;
};

export async function buildSelfTest(): Promise<any> {
  // 后台抽题
  const extractedQuestionsList: { questions: SelfTest.Question[] }[] = await extractQuestions();
  // 按规则随机抽题
  const filteredQuestionsList: { questions: SelfTest.Question[] }[] =
    filterQuestions(extractedQuestionsList);
  // 按要求决定是否排序
  const sortedQuestionsList: { questions: SelfTest.Question[] }[] = isSort
    ? sortQuestions(filteredQuestionsList)
    : filteredQuestionsList;
  // 生成符合 view 要求的格式
  const transformedQuestions: { questions: SelfTest.QuestionProps[] }[] =
    transformQuestions(sortedQuestionsList);
  generatedTest = transformedQuestions;
  return generatedTest;
}
