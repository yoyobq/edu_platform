import { Alert, Button, Modal } from 'antd';
import type { ReactChild } from 'react';
import React, { useState } from 'react';
import styles from '../index.less';

interface FunctionPanelProps {
  // eslint-disable-next-line @typescript-eslint/ban-types
  handInPaper: Function;
  score: number;
  hasDone: boolean;
  restTest: React.MouseEventHandler<HTMLElement> | undefined;
  // showWrong: React.MouseEventHandler<HTMLElement> | undefined;
}

const FunctionPanel: React.FC<FunctionPanelProps> = ({ handInPaper, score, hasDone, restTest }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    // 从未结分，双保险
    if (score === -1 && !hasDone) {
      handInPaper();
    }
    setIsModalVisible(true);
  };

  const handleClose = () => {
    setIsModalVisible(false);
  };

  // const getScore = () => {
  //   let myScore = 0;
  //   handInPaper();
  //   myScore = score;
  //   score = 0;
  //   score = myScore;
  //   return score;
  // };
  // const handleCancel = () => {
  //   setIsModalVisible(false);
  // };

  const AlertBoard: ReactChild = (
    <Alert message="在试卷中订正错题，不会改变本次得分。" type="info" showIcon />
  );

  return (
    <>
      <ul className={styles[`function-btn`]}>
        <li>
          <Button onClick={showModal} type="primary">
            {score >= 0 || hasDone ? '查看得分' : '提交判分'}
          </Button>
        </li>
        <li>
          {score >= 0 || hasDone ? (
            <Button key="reset" type="primary" onClick={restTest} danger>
              重置测验
            </Button>
          ) : null}
        </li>
        {/* <li>{ score>=0 || hasDone ? <Button key="showWrong" type="primary" onClick={ showWrong } className='button-color-sunset'>查看错题</Button> : null }</li> */}
      </ul>
      <Modal
        title="测验完成"
        visible={isModalVisible}
        onCancel={handleClose}
        centered
        footer={
          <Button type="primary" onClick={handleClose}>
            关闭
          </Button>
        }
      >
        {AlertBoard}
        <p className={styles[`score-text`]}>{score}分</p>
        {/* <p>请勿关闭窗口，等待教师计分</p> */}
      </Modal>
    </>
  );
};

// const areEqual = (prevProps: QuestionProps, nextProps: QuestionProps) => {
const areEqual = () => {
  return false;
};

export default React.memo(FunctionPanel, areEqual);
