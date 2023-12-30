import { Alert, Button, Modal } from 'antd';
import type { ReactNode } from 'react';
import React, { useState } from 'react';
import styles from '../index.less';

interface FunctionPanelProps {
  // eslint-disable-next-line @typescript-eslint/ban-types
  handInPaper: Function;
  score: number;
  hasFinished: boolean;
  restTest: React.MouseEventHandler<HTMLElement> | undefined;
  // showWrong: React.MouseEventHandler<HTMLElement> | undefined;
}

const FunctionPanel: React.FC<FunctionPanelProps> = ({
  handInPaper,
  score,
  hasFinished,
  restTest,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    // 从未结分，双保险
    if (score === -1 && !hasFinished) {
      handInPaper();
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
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
  //   setIsModalOpen(false);
  // };

  const AlertBoard: ReactNode = (
    <Alert message="在试卷中订正错题，不会改变本次得分。" type="info" showIcon />
  );

  return (
    <>
      <ul className={styles[`function-btn`]}>
        <li>
          <Button onClick={showModal} type="primary">
            {score >= 0 || hasFinished ? '查看得分' : '提交判分'}
          </Button>
        </li>
        <li>
          {score >= 0 || hasFinished ? (
            <Button key="reset" type="primary" onClick={restTest} danger>
              重置测验
            </Button>
          ) : null}
        </li>
        {/* <li>{ score>=0 || hasFinished ? <Button key="showWrong" type="primary" onClick={ showWrong } className='button-color-sunset'>查看错题</Button> : null }</li> */}
      </ul>
      <Modal
        title="测验完成"
        open={isModalOpen}
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
