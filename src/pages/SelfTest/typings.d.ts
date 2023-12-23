declare namespace SelfTest {
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

  type TestPaperConfig = {
    sglNum: number;
    judNum: number;
    mulNum: number;
  };

  type QuestionProps = {
    custom_id: number;
    topic: string;
    options: string[];
    answer?: string;
    // 题目类型 'sgl','mul','jug'
    type: string;
    // 题目所属知识章节
    chapter?: string;
    // 题图路径（若有）
    pic_path?: string;
    // 备注：题目来源，提供者等
    remarks?: string;

    // 以下是api不提供数据
    // 用户目前选择的答案
    currentAnswer?: string;
    // 是否做对了
    isCorrect?: boolean;
    // 打乱选项后标签
    orderedTag?: string[];
    No: number;
    // onChange: (
    //   value: string,
    //   event?:
    //   | React.MouseEvent<HTMLElement, MouseEvent>
    //   | React.KeyboardEvent<HTMLInputElement>
    //   | undefined,
    // ) => void;
    onChange: any;
  };

  type QuestionListProps = {
    id: number;
    title: string;
    questions: QuestionProps[];
  };

  type TestStates = {
    questionList: QuestionListProps[];
    hasDone: boolean;
    score: number;
  };

  type TestProps = {
    onChange?: any;
    test: TestStates;
    testRule: RuleStates;
  };

  // 定义此Model的类型
  type TestModel = {
    // namespace: string;
    state: {
      questionList: [];
      hasDone: boolean;
      score: number;
    };
  };

  type RuleProp = {
    tableName: string;
    id: number;
    type: string;
    describe: string;
    startQuNo: number;
    endQuNo: number;
    quantity: number;
    scorePreQu: number; // 每题得分
    maxNumber: number; // 本套试卷本类型题目的极值
  };

  type RuleStates = {
    RulePropList: RuleProp[] | [];
  };

  // 定义此Model的类型
  type RuleModel = {
    // namespace: string;
    state: RuleStates;
  };

  // export interface StatusProps {

  // }

  type StatusStates = {
    hasDone: boolean;
    score: number;
    startTime: Date | null;
    endTime: Date | null;
  };

  type StatusModel = {
    namespace: 'testStatus';
    // namespace: string;
    state: StatusStates;
  };
}
