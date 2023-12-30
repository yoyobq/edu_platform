/* eslint-disable @typescript-eslint/no-unused-vars */
import { useModel } from '@umijs/max';
import { buildSelfTest, calScore } from './model';
// import { Alert, message, Tabs } from 'antd';
import produce from 'immer';
import React, { useEffect, useState } from 'react';
// import { useRequest } from 'umi';
import FunctionPanel from './components/FunctionPanel';
import JugQuestion from './components/JugQuestion';
import MulQuestion from './components/MulChoice';
import ResultBoard from './components/ResultBoard';
import SglChoice from './components/SglChoice';
import styles from './index.less';

enum CharNum {
  '一' = 1,
  '二',
  '三',
  '四',
  '五',
  '六',
}

const SelfTest: React.FC = () => {
  // 从 @@initialState 读取默认设置的全局初始数据并存放到 state 变量 initialState 中去。
  const { initialState, setInitialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(true);
  // 记录测试是否完成，并记录评分
  const [testStatus, setTestStatus] = useState({
    hasFinished: false,
    score: -1,
    // 其他与测试相关的数据
  });

  // 一次失败的尝试，记录下我的理解: useRequest 着重的点是“实时刷新后台数据”，
  // 他会很好的处理页面与后台的交互
  // 但对于只要抽取一次的数据，就显得很多余，还不如用 useEffect
  // useRequest 能够处理异步，无需 async/await
  // const { data, error, loading, run } = useRequest(buildSelfTest);

  const [questionsList, setquestionsList] = useState<SelfTest.QuestionsListProps[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res: SelfTest.QuestionsListProps[] = await buildSelfTest();
      // 成功获取试题数据
      setquestionsList(res);
    } catch (error) {
      throw new Error('与 service 的通讯失败。');
    } finally {
      // 请求结束，设置 loading 为 false
      setLoading(false);
    }
  };

  useEffect(() => {
    // 调用获取数据的函数
    fetchData();
  }, []); // 空数组，保证仅在组件首次挂载时执行

  if (loading) {
    return null;
  }

  const typeArray = questionsList!.map((item) => item.type);

  // 修改对应questionList中的对应questions的答案
  const onAnswerChange = (value: any, No: number, type: string): void => {
    let typeIdx: number = 0;
    if (typeArray[0] !== 'mix') {
      // 否则的话根据前台反馈的题目类型（例如'sgl'），
      typeIdx = typeArray.findIndex((item: string) => item === type);
    }

    // 只有多选题才会返回数组
    if (type === 'mul') {
      value.sort();
      // eslint-disable-next-line no-param-reassign
      value = value.join('');
    }

    const newState = produce(questionsList, (draftState) => {
      draftState![typeIdx].questions[No].currentAnswer = value;
      if (value === draftState[typeIdx].questions[No].answer) {
        draftState[typeIdx].questions[No].isCorrect = true;
      } else {
        draftState[typeIdx].questions[No].isCorrect = false;
      }
    });

    // console.log(newState![typeIdx].questions[No].isCorrect);
    // console.log('answer', newState![typeIdx].questions[No].answer);

    setquestionsList(newState);
  };

  const handInPaper = async () => {
    const newState = calScore(testStatus, questionsList);
    setTestStatus(newState);
  };

  const resetTest = () => {
    setTestStatus({
      hasFinished: false,
      score: -1,
    });
    fetchData();
  };

  // if (error) {
  //   return null;
  // }

  let titleCount = 0;
  const allQuestions: React.ReactNode = questionsList!.map((questionsItem: any) => {
    const questions: React.ReactNode = questionsItem.questions.map((item: any) => {
      if (item.quantity !== 0) {
        switch (item.type) {
          case 'sgl':
            return (
              <section key={`sgl${item.No}`} className={styles.tranRelative}>
                <SglChoice
                  topic={item.topic}
                  options={item.options}
                  answer={item.answer}
                  currentAnswer={item.currentAnswer}
                  isCorrect={item.isCorrect}
                  orderedTag={item.orderedTag}
                  custom_id={item.custom_id}
                  pic_path={item.pic_path}
                  No={item.No}
                  type={item.type}
                  onChange={onAnswerChange}
                />
                {testStatus.hasFinished ? (
                  <ResultBoard isCorrect={item.isCorrect} realAnswer={item.answer} />
                ) : null}
              </section>
            );
          case 'mul':
            return (
              <section key={`mul${item.No}`} className={styles.tranRelative}>
                <MulQuestion
                  topic={item.topic}
                  options={item.options}
                  answer={item.answer}
                  currentAnswer={item.currentAnswer}
                  isCorrect={item.isCorrect}
                  orderedTag={item.orderedTag}
                  custom_id={item.custom_id}
                  pic_path={item.pic_path}
                  No={item.No}
                  type={item.type}
                  onChange={onAnswerChange}
                  // loading = {isLoading}
                />
                {testStatus.hasFinished ? (
                  <ResultBoard isCorrect={item.isCorrect} realAnswer={item.answer} />
                ) : null}
              </section>
            );
          case 'jug':
            // console.log(item);
            return (
              <section key={`jug${item.No}`} className={styles.tranRelative}>
                <JugQuestion
                  topic={item.topic}
                  options={item.options}
                  answer={item.answer}
                  currentAnswer={item.currentAnswer}
                  isCorrect={item.isCorrect}
                  orderedTag={item.orderedTag}
                  custom_id={item.custom_id}
                  pic_path={item.pic_path}
                  No={item.No}
                  type={item.type}
                  onChange={onAnswerChange}
                  // loading = {isLoading}
                />
                {testStatus.hasFinished ? (
                  <ResultBoard
                    isCorrect={item.isCorrect}
                    realAnswer={item.answer === '1' ? '正确' : '错误'}
                  />
                ) : null}
              </section>
            );
          default:
            return null;
        }
      }
      return null;
    });
    titleCount += 1;

    return (
      <React.Fragment key={`${questionsItem.id}title`}>
        <header className={styles[`qu-title`]}>
          {questionsItem.title !== '' ? `${CharNum[titleCount]}、` : null}
          {questionsItem.title}
        </header>
        {questions}
      </React.Fragment>
    );
  });

  // 引入 i18n 国际化
  // const intl = useIntl();

  return (
    <div>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        {allQuestions}
      </div>
      <FunctionPanel
        handInPaper={handInPaper}
        score={testStatus.score}
        hasFinished={testStatus.hasFinished}
        restTest={resetTest}
      />
      {/* <Footer /> */}
    </div>
  );
};

export default SelfTest;
