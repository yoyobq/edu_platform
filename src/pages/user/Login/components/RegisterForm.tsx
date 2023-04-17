import {
  CheckCard,
  ProForm,
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
  // ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-components';
import { Avatar, message, Modal } from 'antd';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

interface RegisterFormProps {
  visible: boolean;
  hideModal: () => void;
}

export const RegisterFrom: React.FC<RegisterFormProps> = (props) => {
  const { visible, hideModal } = props;
  return (
    <>
      <StepsForm
        onFinish={async (values) => {
          console.log(values);
          await waitTime(1000);
          hideModal();
          message.success('提交成功');
        }}
        formProps={{
          validateMessages: {
            required: '此项为必填项',
          },
        }}
        stepsFormRender={(dom, submitter) => {
          return (
            <Modal
              title="分步表单"
              width={800}
              onCancel={() => hideModal()}
              open={visible}
              footer={submitter}
              destroyOnClose
            >
              {dom}
            </Modal>
          );
        }}
      >
        <StepsForm.StepForm
          name="base"
          title="身份选择"
          onFinish={async () => {
            await waitTime(2000);
            return true;
          }}
        >
          <ProForm.Group title="身份">
            <CheckCard.Group style={{ width: '100%' }}>
              <CheckCard
                title="教师"
                avatar={
                  <Avatar
                    src="https://gw.alipayobjects.com/zos/bmw-prod/2dd637c7-5f50-4d89-a819-33b3d6da73b6.svg"
                    size="large"
                  />
                }
                description="教师账号可以访问更多的学院内部信息，但需要通过更严格的身份认证。"
                value="teacher"
              />
              <CheckCard
                title="学生"
                avatar={
                  <Avatar
                    src="https://gw.alipayobjects.com/zos/bmw-prod/6935b98e-96f6-464f-9d4f-215b917c6548.svg"
                    size="large"
                  />
                }
                description="学生可通过自己的专属账号，参与教学过程，获取教学内容。"
                value="student"
              />
              {/* <CheckCard
                title="教工"
                avatar={
                  <Avatar
                    src="https://gw.alipayobjects.com/zos/bmw-prod/d12c3392-61fa-489e-a82c-71de0f888a8e.svg"
                    size="large"
                  />
                }
                description="使用前后端统一的语言方案快速构建后端应用"
                value="assistant"
              /> */}
            </CheckCard.Group>
          </ProForm.Group>
          <ProFormText
            name="name"
            width="md"
            label="您的姓名"
            // tooltip="最长为 24 位，用于标定的唯一 id"
            placeholder="请输入姓名"
            rules={[{ required: true }]}
          />
          <ProFormText
            name="name"
            width="md"
            label="您的工号"
            tooltip="请提供校园网工号，用于验证教师身份"
            placeholder="请输入工号"
            rules={[{ required: true }]}
          />
        </StepsForm.StepForm>
        {/*
          <ProFormText
            name="name"
            width="md"
            label="实验名称"
            tooltip="最长为 24 位，用于标定的唯一 id"
            placeholder="请输入名称"
            rules={[{ required: true }]}
          />
        <ProFormDatePicker name="date" label="日期" />
          <ProForm.Group title="时间选择">
            <ProFormDateTimePicker name="dateTime" label="开始时间" />
            <ProFormDatePicker name="date" label="结束时间" />
          </ProForm.Group>
          <ProFormTextArea name="remark" label="备注" width="lg" placeholder="请输入备注" />*/}

        {/* 
        <StepsForm.StepForm name="checkbox" title="验证邮箱">
          <ProFormCheckbox.Group
            name="checkbox"
            label="迁移类型"
            width="lg"
            options={['结构迁移', '全量迁移', '增量迁移', '全量校验']}
          />
          <ProForm.Group>
            <ProFormText width="md" name="dbname" label="业务 DB 用户名" />
            <ProFormDatePicker name="datetime" label="记录保存时间" width="sm" />
            <ProFormCheckbox.Group
              name="checkbox"
              label="迁移类型"
              options={['完整 LOB', '不同步 LOB', '受限制 LOB']}
            />
          </ProForm.Group> 
        </StepsForm.StepForm> */}

        <StepsForm.StepForm name="time" title="完成设置">
          <ProFormCheckbox.Group
            name="checkbox"
            label="部署单元"
            rules={[
              {
                required: true,
              },
            ]}
            options={['部署单元1', '部署单元2', '部署单元3']}
          />
          <ProFormSelect
            label="部署分组策略"
            name="remark"
            rules={[
              {
                required: true,
              },
            ]}
            width="md"
            initialValue="1"
            options={[
              {
                value: '1',
                label: '策略一',
              },
              { value: '2', label: '策略二' },
            ]}
          />
          <ProFormSelect
            label="Pod 调度策略"
            name="remark2"
            width="md"
            initialValue="2"
            options={[
              {
                value: '1',
                label: '策略一',
              },
              { value: '2', label: '策略二' },
            ]}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  );
};
